---
title: "One kernel per container: the cloud walks back its shortcut"
summary: "AWS now puts each container in its own small virtual machine. The cloud course explains why: a container owes its lightness to the shared kernel, and that sharing is the problem once the code is unknown."
hook: "Containers are light because they share one operating system; Amazon now gives each its own, because that sharing becomes risky when the code being run was written by an AI."
category: "perspective"
date: "2026-11-10"
written: "2026-11"
readingMinutes: 5
course: "Cloud computing et informatique distribuée (2A)"
courseSlug: "cloud-computing-et-informatique-distribuee-2a"
news:
  title: "Nitro Sandboxes: Hardware isolation for every EKS pod, ECS task, and EC2 workload"
  source: "AWS Compute Blog"
  url: "https://aws.amazon.com/blogs/compute/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/"
  date: "2026-11-10"
---

On November 10, Amazon Web Services (AWS) introduced Nitro Sandboxes. The idea: each container started on a machine rented from AWS can now run inside its own small virtual machine, with its own kernel, at no extra charge. Among the uses AWS mentions are AI agents, which run code that nobody has reviewed. The announcement walks back a choice that my cloud computing course presented as the advantage of containers.

## Two ways to fit several programs on one machine

A cloud provider runs the programs of many customers on the same servers. The course states the dilemma plainly. Several services on one machine make good use of resources but offer limited isolation. One service per machine is the opposite: well isolated, but hardware is wasted.

The first answer is the virtual machine. The course defines it as an environment that behaves like a computer, with its own processor, memory, network and storage. A piece of software called a hypervisor manages the exchanges between these virtual machines and the real hardware. Each one carries a full operating system, and therefore its own kernel, meaning the central program that talks to the hardware and arbitrates between applications. The drawback is weight: the course quotes an author for whom packaging a single application in a virtual machine amounts to using a gigantic ship to carry a truckload of bananas.

The second answer is the container: a standard box holding a program and its dependencies, and nothing else. The course describes it as a sort of lightweight virtual machine, adding at once that it is not one. Docker, the tool studied in the course, speaks of a "loosely isolated" environment. The reason fits in one line of the course: Docker relies on features of the Linux kernel, which give each container a separate view of the system and a cap on resources. All the containers on a machine therefore talk to the same kernel.

```figure
file: fig-1.en.svg
caption: A virtual machine carries its own kernel, containers share the host's
scroll: The two stacks build up side by side, then the kernels light up in orange
steps:
- On the left, the virtual machine. A hypervisor shares the hardware between machines that each carry a full operating system.
- On the right, containers. They hold only the application and its dependencies, and all rest on the host machine's system.
- The difference is the number of kernels. Each virtual machine has its own, while all containers talk to the same one.
```

## What the shared kernel costs

This sharing is what makes a container quick to build and to start. It is also what limits isolation. The separation between two containers is a rule enforced by the kernel. If a program finds a flaw in that kernel, the rule is gone, and it can reach its neighbours. The AWS engineer who signs the announcement puts it this way: the containers on a machine all trust one Linux kernel.

As long as you run your own code, reviewed and tested, the risk stays moderate. It changes in kind in three cases named by AWS: AI agents that write code and then run it, applications that host several customers on the same machines, and build pipelines that run code submitted by strangers.

```figure
file: fig-2.en.svg
caption: With a shared kernel a flaw reaches the neighbours; with one kernel per sandbox it stays contained
scroll: An attack starts from container B, reaches the common kernel, then the drawing is replaced by three separate kernels
steps:
- Three containers run on the same machine. They all go through the same Linux kernel.
- Container B runs hostile code, for instance written by a manipulated AI agent. That code attacks the kernel.
- If the kernel gives way, the separation between containers falls with it. A and C are exposed without having done anything.
- With one sandbox per container, B can only break its own kernel. The boundary with A and C is held by the hypervisor and the hardware.
```

## What AWS does, and at what price

A Nitro Sandbox is a lightweight virtual machine started from a machine that is already rented, called the parent instance. It runs alongside its parent, directly on the AWS hypervisor, and not inside it. This avoids stacking two layers of virtualization, which according to AWS gives performance close to that of an ordinary machine. No measurement comes with that claim.

The documentation does give the limits. A sandbox borrows its virtual processors (vCPUs, the rented execution threads) and its memory from the parent instance. On a 4-vCPU instance, you can start up to 20 one-vCPU sandboxes, which is 5 per vCPU. Each sandbox needs at least 256 MiB of memory (one MiB is about a million bytes), plus 2 MiB of overhead. Twenty sandboxes therefore reserve at least 20 × 256 = 5,120 MiB, or 5 GiB. A classic container has no such floor, since it has no kernel to house.

```figure
file: fig-3.en.svg
caption: What a 4-vCPU instance can carry, according to the AWS documentation
scroll: Twenty sandboxes settle on four vCPUs, then the memory of each and the number of real cores appear
steps:
- The parent instance rents 4 vCPUs. Sandboxes add no computing power, they share this one.
- AWS allows 5 sandboxes per vCPU of the parent, so 20 one-vCPU sandboxes here. They take turns on the same processors.
- Each sandbox reserves at least 256 MiB to house its kernel and its program. The 2 MiB of overhead is barely visible at this scale.
- On processors with two threads per core, a core serves only one sandbox at a time. Four vCPUs make two cores, so at most two sandboxes compute at the same instant.
```

## What to take away

The banana ship from the course has not disappeared, it has been shrunk: a sandbox is still heavier than a container, but twenty of them fit on a small machine. The shared-kernel shortcut was acceptable as long as the code came from the team operating it. AI agents change that assumption, and the industry is putting a hardware wall back where it had removed one.

The notion does not say everything. A hypervisor is software too, and can have flaws of its own. The AWS documentation itself points to possible leaks through the network: one sandbox can exhaust network resources shared by all, and read the credentials of the parent instance unless that access is blocked. Isolating the kernel solves one specific problem, not all of them.

## Sources

- [Nitro Sandboxes: Hardware isolation for every EKS pod, ECS task, and EC2 workload (AWS Compute Blog)](https://aws.amazon.com/blogs/compute/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/)
- [Full republication of the AWS post, dated November 10, 2026 (Noise)](https://noise.getoto.net/2026/11/10/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/)
- [Isolate workloads with AWS Nitro Sandboxes (Amazon EC2 documentation)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-nitro-sandboxes.html)
- [AWS Rolls Out Nitro Sandboxes to Give Containers Their Own VM Security Boundary (Cloud Native Now, November 17, 2026)](https://cloudnativenow.com/features/aws-rolls-out-nitro-sandboxes-to-give-containers-their-own-vm-security-boundary/)
