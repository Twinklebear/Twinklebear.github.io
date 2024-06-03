---
layout: single
date: 2018-07-10
title: "Comments in LaTeX"
tags: [latex]
url: /latex/2018/07/10/comments-in-latex

---

When writing a paper in LaTeX, it's common to leave
notes and comments in the text, either to yourself
or your co-authors. I used to write these
as just different colored text using `\textcolor{...}`,
with each author assigned a color, or all with the same color.
However, with more authors
it can get hard to keep picking legible font colors.
Futhermore, sometimes just a different color font doesn't
stand out quite as much as I'd like from the rest of the text.
More recently I've switched to using highlights for
the comments, which works well with multiple authors,
and helps the comments stand out from the rest of
the text. This is easy to do with the
[soul](https://ctan.org/pkg/soul?lang=en) and
[xcolor](https://ctan.org/pkg/xcolor?lang=en) packages.

<!--more-->

The soul package lets you highlight text, while
the xcolor package provides some convenient color names
(I use it with the dvipsnames option). With these packages
you can then create commands for each author to write
their comments as `\authorname{comment}`, as shown below.
This sample is also available on
[Overleaf](https://www.overleaf.com/read/nsxknypvpfhh), so
you see it in action.

```latex
\documentclass{article}
\usepackage[utf8]{inputenc}

\usepackage{soul}
\usepackage[dvipsnames]{xcolor}

% We also use DeclareRobustCommand instead of
% NewCommand so that the command will work in captions
% and other contexts as well.
\DeclareRobustCommand{\will}[1]{ {\begingroup\sethlcolor{BurntOrange}\hl{(will:) #1}\endgroup} }

\begin{document}
% The highlight comment command can then be used in the text
\will{This is an example comment!}

\begin{figure}
% Or in captions, etc.
\caption{\will{By making it robust, we can also use it in captions.}}
\end{figure}

\end{document}

```

