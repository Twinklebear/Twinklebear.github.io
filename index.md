---
layout: page
title: Programs on the Internet
---
{% include JB/setup %}

I'll come up with something to put here soon enough 

### Posts:
<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span>: <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>

