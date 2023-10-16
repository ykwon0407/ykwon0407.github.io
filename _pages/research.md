---
layout: archive
title: "Research"
permalink: /research/
author_profile: true
---

I am working on developing a principled and pracitcal data contribution estimation (a.k.a. data valution) algorithms. With data valuation algorithms, our goal is to assess the quality of individual data points for improving model performance and mitigating biases. Please see [*Publications*](/publications) for more.

## OpenDataVal

<div width="500" align="left">
<a href="https://github.com/opendataval/opendataval">
    <picture>
      <img src="/images/odv_illustration.png"  width="450" align="left">
    </picture>
</a>
</div>

Numerous data valuation algorithms have been proposed in the literature, yet it is not clear which method is the most effective and appropriate to downstream machine learning tasks. For instance, what method should I use for detecting anomalies in my training dataset or interpreting model predictions? In our recent work, we introduce **an open-source, easy-to-use and unified environment** called [**OpenDataVal**](https://opendataval.github.io/). It provides a benchmarking framework for various state-of-the-art data valuation algorithms including classic methods like the leave-one-out method and influence functions, as well as more modern Shapley-based methods and Data-OOB. You can compute the value of your data with a few lines of Python codes!!

