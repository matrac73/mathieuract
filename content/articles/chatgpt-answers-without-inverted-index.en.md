---
title: "ChatGPT answers without looking anything up: what separates it from a search engine"
summary: "OpenAI releases ChatGPT and warns that it sometimes writes plausible but incorrect answers. The inverted index and precision, from an information retrieval course, show why it is not a search engine."
hook: "ChatGPT does not fetch any document: it writes its answer word by word, which makes it fluent but impossible to check on the spot, whereas a search engine only returns pages that exist."
category: "perspective"
date: "2022-11-30"
written: "2022-11"
readingMinutes: 5
course: "Web data intelligence (1A)"
courseSlug: "web-data-intelligence-1a"
news:
  title: "OpenAI introduces ChatGPT"
  source: "OpenAI"
  url: "https://openai.com/blog/chatgpt"
  date: "2022-11-30"
---

## What happened

On 30 November, OpenAI puts ChatGPT online, a program you talk to in writing. Access is free during this phase, which the company calls a research preview and opens in order to collect feedback from users. According to OpenAI, the model answers questions, follows the thread of a conversation, admits its mistakes and declines some requests. It derives from a model of the GPT-3.5 series, fine-tuned with the help of people who wrote dialogues and then ranked answers.

The list of limitations published by OpenAI starts with this one: ChatGPT sometimes writes answers that sound right but are incorrect or nonsensical. Since people ask it questions the way they query a search engine, the comparison comes naturally. The information retrieval course lets me make it properly.

## What the course says: an engine returns documents

A search engine does not read the web at the moment you query it. It has prepared an inverted index in advance: for each term, the list of documents that contain it. The course builds one on a collection of five sentences about home sales, called d1 to d5. The term "july" points to d2, d3 and d4. The term "new" points to d1 and d4. The term "home" points to all five.

Terms do not all have the same value. The course gives them a weight, the IDF (inverse document frequency): log(N / df), where N is the number of documents and df the number of those that contain the term. With N = 5 and base-10 logarithms, "july" is worth log(5/3) ≈ 0.22, "new" is worth log(5/2) ≈ 0.40 and "home" is worth log(5/5) = 0. A word that appears everywhere tells no document apart. IDF is one half of the TF-IDF weighting. The other half, TF, counts how many times the term appears in the document, and equals 1 everywhere here.

For the query "july new", I add up the weights of the terms present in each document. d4 contains both and scores 0.62. d1 scores 0.40, d2 and d3 score 0.22, d5 scores nothing and is not returned.

```figure
file: fig-1.en.svg
caption: A search engine goes through an index and returns ranked documents
scroll: Five documents sit on the left, the inverted index appears in the centre, then the ranking on the right, and an orange line brings the top result back to its document.
steps:
- The course collection holds five documents, d1 to d5. These, and only these, are what the engine can return.
- The inverted index gives, for each term, the list of documents that contain it. A rare term weighs more than a term found everywhere.
- For the query "july new", each document receives the sum of the weights of its terms. d4 contains both words and comes first.
- The top result is document d4 itself. You can open it and read it to check.
```

The point that matters for what follows is that an engine's answer is a list of documents that exist. The engine can be wrong, and the course measures that error with two numbers. Precision is the share of returned documents that are relevant. Recall is the share of relevant documents that are returned. In one exercise of the course, a system returns 200 documents of which 170 are relevant, while the collection holds 190 relevant ones. Precision is 170 / 200 = 0.85 and recall is 170 / 190 ≈ 0.89.

## What ChatGPT does: a sentence, not a document

GPT-3, the family ChatGPT comes from, is described by its authors as an autoregressive language model with 175 billion parameters. Autoregressive means that it produces text one piece after another, each piece being chosen according to the ones before it. According to TechCrunch, GPT-3.5 was trained on text and code published before the last quarter of 2021, and it relies on the statistical regularities of that data.

So there is no index and no list of documents. Take a sentence that starts with "The capital of Australia is". I make up probabilities for the example: Canberra 55%, Sydney 35%, Melbourne 10%. If the model draws the next word according to these probabilities, it writes Sydney about one time in three. The sentence is well formed, it is plausible, and it is wrong. OpenAI also notes that the same question asked twice can receive two different answers.

```figure
file: fig-2.en.svg
caption: A language model picks the next word according to its probability
scroll: An unfinished sentence waits for its last word, three probability bars appear, then the orange bar sends a wrong word into the empty box.
steps:
- The model has already written the start of the sentence. It still has to produce the next word.
- It assigns a probability to each possible word, based on the texts it was trained on. The figures are made up for the example.
- The draw lands here on Sydney, which had a 35% chance. The sentence is fluent and plausible, but it is wrong.
- Nothing ties this sentence to a document. There is no page to open in order to check it.
```

## What the comparison makes clear

The first difference is about checking. A search result is an address: you open the page, you see who wrote it, you judge. ChatGPT's answer is a new text that exists nowhere else.

The second is about silence. In the Boolean model of the course, a query such as "sale AND increase" only returns the documents that contain both terms, and a term absent from the index gives an empty list. A language model always has a next word to offer. OpenAI writes that making it more cautious leads it to decline questions it could answer correctly.

The third is about measurement. Precision counts documents, and the user sees the bad results in the list. In a written answer, the error is one claim among others, written in the same tone. OpenAI acknowledges that the problem is hard to fix, in particular because there is no source of truth during training.

```figure
file: fig-3.en.svg
caption: An engine's errors can be counted, those of a written answer are hidden
scroll: A grid of 200 squares fills in on the left and 30 of them turn grey, then a block of text appears on the right and a single segment turns orange.
steps:
- In the course exercise, the engine returns 200 documents for one query. Each square is a document you can open.
- 170 are relevant and 30 are not. Precision is 170 / 200, that is 0.85.
- ChatGPT returns a single written answer. All its sentences carry the same assurance.
- If one claim is false, nothing flags it. You cannot count the errors without checking each sentence elsewhere.
```

## What to take away

ChatGPT is not an improved search engine, it is a different object. An engine retrieves, ChatGPT writes. So I keep one simple rule: any fact it states gets checked elsewhere.

The notion does not say everything. Relevant does not mean true: an engine can perfectly well rank a mistaken page first, it only leaves the reader the means to judge the source. Precision and recall do not measure what ChatGPT brings either, namely drafting, rephrasing and following a conversation, which no index does. Finally, my Australian example is a caricature: a real model handles fragments of words, and its probabilities are not the ones I made up.

## Sources

- [OpenAI, 30 November 2022: ChatGPT](https://openai.com/blog/chatgpt)
- [TechCrunch, 1 December 2022: While anticipation builds for GPT-4, OpenAI quietly releases GPT-3.5](https://techcrunch.com/2022/12/01/while-anticipation-builds-for-gpt-4-openai-quietly-releases-gpt-3-5/)
- [Brown et al., 28 May 2020: Language Models are Few-Shot Learners (arXiv:2005.14165)](https://arxiv.org/abs/2005.14165)
- Web data intelligence (1A) course, CentraleSupélec: corrected information retrieval exam, exercises on the inverted index, IDF weighting, the Boolean model, precision and recall.
