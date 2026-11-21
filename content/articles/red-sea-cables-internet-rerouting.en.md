---
title: "Cables cut in the Red Sea: why the Internet slows down without going dark"
summary: "Three undersea cables are cut in the Red Sea and a quarter of the traffic has to change path. Routing, as taught in my networks course, explains why the failure costs speed rather than service."
hook: "When undersea cables are cut in the Red Sea, the Internet does not go down: each router finds another, longer path on its own, and the failure is paid for in slowness rather than in an outage."
category: "perspective"
date: "2024-03-04"
written: "2024-03"
readingMinutes: 5
course: "Réseaux et sécurité (1A)"
courseSlug: "reseaux-et-securite-1a"
news:
  title: "Houthi rebels deny severing three Red Sea underwater cables"
  source: "Associated Press (PBS NewsHour)"
  url: "https://www.pbs.org/newshour/world/houthi-rebels-deny-severing-three-red-sea-underwater-cables"
  date: "2024-03-04"
---

## What happened

On 4 March, the Hong Kong operator HGC Global Communications announces that several undersea telecommunication cables are cut in the Red Sea: Asia-Africa-Europe 1, Europe India Gateway, and the Seacom and TGN-Gulf pair, which is a single cable at that location. According to HGC, the cut affects 25% of the traffic flowing through the Red Sea. The research firm TeleGeography, quoted by the Associated Press, counts fourteen cables in that sea, carrying more than 90% of communications between Europe and Asia. The cause is not established: Seacom finds it plausible that an anchor dragged along the seabed, and the Houthis deny any responsibility.

What interests me here is what comes next. The operators do not talk about an Internet outage, they talk about "rerouted" traffic. HGC says it is sending its data to Europe through land cables in China, under the Pacific and then across the United States, and through the remaining Red Sea cables. Seacom adds that some of its services are still down.

## What the course says: a router only knows its neighbours

On the Internet, data travels in packets, small pieces of information that each carry the address of their recipient. The networks course defines a router as the device that connects several networks: it reads the packet's destination address, compares it with its routing table, meaning the list "to get there, send through this link", then forwards the packet. The decision depends only on the destination. No path is reserved in advance.

Who fills in that table? A routing algorithm. The course separates two families. Link-state algorithms reason on the full map of the network, with Dijkstra's algorithm. Distance-vector algorithms reason step by step, with the Bellman-Ford algorithm: each router tells its neighbours how far it is from each destination, and each one keeps the neighbour for which the sum "cost of the link + advertised distance" is smallest.

Take a toy network, which I am making up for the example, with three routes between Asia and Europe and delays in milliseconds. Through the Red Sea: 40 + 30 = 70 ms. Through China: 50 + 50 = 100 ms. Through the Pacific: 80 + 60 = 140 ms. The router in Asia picks 70. If the Red Sea cable is cut, the neighbour on that side no longer advertises a route. The router runs the same calculation on what is left and picks 100. Nobody had to draw a new map.

```figure
file: fig-1.en.svg
caption: A router recomputes its path after a cable is cut
scroll: The orange path first goes through the Red Sea, the cable breaks, the neighbours advertise their distances and the orange path is redrawn through the north.
steps:
- Three routes link Asia to Europe. The router in Asia adds up the delays and keeps the shortest one, through the Red Sea, at 70 ms.
- The Red Sea cable is cut. That link no longer carries anything.
- Each neighbour advertises its distance to Europe. The Red Sea neighbour has no route left, which is written as an infinite distance.
- The router in Asia does the same addition with the remaining adverts. The best path now goes through China, in 100 ms.
```

This is what Tata Communications, the owner of one of the affected cables, sums up when it says it can reroute its services automatically.

## The price of the detour: delay and full queues

The course warns that IP, the protocol that carries packets, works on a "best effort" basis: it guarantees neither the path taken, nor the throughput, nor the delay. So the detour has two costs.

The first is delay. Propagation time is the distance divided by the speed of the signal, and the course uses 0.7 × c in a cable, about 210,000 km per second. The 70 ms of my example correspond to 14,700 km of fibre, and the 140 ms of the Pacific route to 29,400 km. Since a reply has to come back, the gap counts twice.

```figure
file: fig-2.en.svg
caption: Propagation delay grows in proportion to the length of the path
scroll: A straight line is drawn, then a white dot marks the direct route and two orange dots mark the detours, higher up the line.
steps:
- In a fibre, the signal covers about 210,000 km per second. Delay is therefore proportional to distance.
- The direct route of the example, 14,700 km, takes 70 ms one way.
- The detours are longer. About 21,000 km through China gives 100 ms, and 29,400 km through the Pacific gives 140 ms.
- A reply makes the trip out and back. The detour therefore adds 60 to 140 ms to each exchange.
```

The second cost is congestion. The remaining cables receive their usual traffic, plus that of the cut cables. A router stores waiting packets in a queue. The course says what happens when it is full: the router drops packets. If 12 packets arrive every second on a link that sends out 10, the queue grows by 2 packets per second, and a queue with 6 slots overflows in under three seconds. Real routers handle millions of packets, but the calculation is the same.

```figure
file: fig-3.en.svg
caption: A backup link that receives more packets than it can send out
scroll: The router's queue fills up slot by slot, then orange packets fall out of the queue.
steps:
- In normal times, the link sends out 10 packets per second and receives only 8. The queue stays almost empty.
- The traffic from the cut cables arrives on this link. It receives 12 packets per second and the queue grows by 2 packets per second.
- The queue is full. The router drops the extra packets that arrive.
- TCP, the protocol that ensures data is delivered, resends the lost packets and tells the sender to slow down. The user sees a slow connection, not an outage.
```

It is TCP, the protocol sitting above IP, that makes up for the losses: it resends what is missing and adapts the sender's rate to the congestion. The course points out that it still guarantees neither a minimum throughput nor a maximum delay.

## What to take away

The Internet withstands this cut because nobody chooses the path on behalf of the routers: each one applies a simple rule based on what its neighbours advertise. Routing does not create any capacity, though. It moves traffic onto what is left, and repairs to undersea cables usually take two to three months, according to the exchange operator DE-CIX. Where there is no other cable, as for some of Seacom's services, there is nothing to recompute and the service stops.

My toy network also simplifies two things. Between operators, the choice of a route depends on commercial agreements, which the course calls transit and peering, and not only on delay. And the figures in my diagrams are orders of magnitude chosen for the example, not measurements of the failure.

## Sources

- [Associated Press via PBS NewsHour, 4 March 2024: Houthi rebels deny severing three Red Sea underwater cables](https://www.pbs.org/newshour/world/houthi-rebels-deny-severing-three-red-sea-underwater-cables)
- [BBC, republished by the Daily Mirror (Sri Lanka), 6 March 2024: Crucial Red Sea data cables cut, telecoms firm says](https://www.dailymirror.lk/print/breaking-news/Crucial-Red-Sea-data-cables-cut-telecoms-firm-says/108-278343)
- [Al Jazeera, 6 March 2024: Why are people blaming the Houthis for cutting the Red Sea cables?](https://www.aljazeera.com/news/2024/3/6/why-are-people-blaming-the-houthis-for-cutting-the-red-sea-cables)
- [IEEE ComSoc Technology Blog, 7 March 2024: HGC Global Communications, DE-CIX and Intelsat perspectives on damaged Red Sea internet cables](https://techblog.comsoc.org/2024/03/07/hgc-global-communications-and-de-cix-perspective-on-damaged-red-sea-internet-cables/)
- Course "Réseaux et sécurité (1A)", CentraleSupélec: revision sheet (2019) and "Réseaux et Sécurité" guide (2022), sections on routers, routing algorithms, the IP protocol, delay calculations and TCP.
