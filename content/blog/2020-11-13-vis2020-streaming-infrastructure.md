---
layout: single
date: 2020-11-13
title: "The VIS 2020 Streaming Infrastructure"
category: general
tags: [python, OBS, livestreaming]
url: /general/2020/11/13/vis2020-streaming-infrastructure

---

Now that it's been a bit over a week since VIS 2020 ended I thought I'd
write up some information on the streaming infrastructure
we used during conference. For context, [IEEE VIS 2020](http://ieeevis.org/year/2020/welcome),
like all conferences this year and likely well into the next, was held as a virtual event.
VIS 2020 was "hosted" by the University of Utah, as it was originally planned (pre-COVID) to
be held in Salt Lake City. My advisor was one of the co-chairs, and asked if I'd volunteer
to be on the Technology Committee for VIS 2020. The role of this committee is to manage the technical
aspects of streaming the event. The change to a virtual format brings a lot of challenges,
especially when pivoting later in the planning cycle (the past in-person events are typically
over a year in the making).
However, the virtual format also brings improvements in terms of accessibility, cost to attendees,
environmental impact, and archiving.

This post will be one part technical documentation and one
part reflection. The feedback we received for VIS 2020 was overwhelmingly positive,
and thus I hope that both the technical documentation on how we ran the event
and the reflection on what worked and didn't are helpful to organizers planning virtual
events through the next year.

Before we begin, I must of course mention that this was not a solo effort.
Alex Bock and Martin Falk were also on the Tech committee and provided valuable
advice about their experience running [EGEV 2020](https://conferences.eg.org/egev20/) as a virtual event earlier this year,
which was also well received. We followed the same model for VIS, which aims to keep
the feeling of a live conference while reducing surface area for technical issues.
I must also mention the amazing work done by Alper Sarikaya, Hendrik Strobelt,
Jagoda Walny, and Steve Petruzza on the web committee setting up the
[virtual conference webpage](https://virtual.ieeevis.org/).
The webpage was adapted from [mini-conf](https://github.com/Mini-Conf/Mini-Conf),
originally written by Alexander Rush and Hendrik Strobelt.
Alper [has written up a blog post about this](https://alper.datav.is/blog/2020/11/virtual-ieee-vis-website/),
so I won't cover it here.
Finally, during the event we had a rotation of about 24 student volunteers
who were responsible for managing the streams and assisting presenters
with technical issues, without whom the event would not have been possible.

<!--more-->

# Sections

<ul>
<li><a href="#1-problem-overview">1. Problem Overview</a></li>
  <ul>
  <li><a href="#11-technical-platform-for-streaming-vis-2020">1.1. Technical Platform for Streaming VIS 2020</a></li>
  </ul>
<li><a href="#2-obs-configuration">2. OBS Configuration</a></li>
<li><a href="#3-scheduling-the-virtual-sessions">3. Scheduling the Virtual Sessions</a></li>
    <ul>
    <li><a href="#31-schedule-management-with-excel-and-python">3.1. Schedule Management with Excel and Python</a></li>
    <li><a href="#32-youtube">3.2. YouTube</a></li>
    <ul>
        <li><a href="#321-scheduling-youtube-broadcasts">3.2.1. Scheduling YouTube Broadcasts</a></li>
        <li><a href="#322-rendering-image-thumbnails-with-pillow">3.2.2. Rendering Image Thumbnails with Pillow</a></li>
    </ul>
    <li><a href="#33-zoom">3.3. Zoom</a></li>
    <li><a href="#34-discord">3.4. Discord</a></li>
    <li><a href="#35-sending-emails-with-amazon-ses">3.5. Sending Emails with Amazon SES</a></li>
    <li><a href="#36-compiling-session-assets">3.6. Compiling Session Assets</a></li>
    </ul>
<li><a href="#4-running-the-virtual-sessions">4. Running the Virtual Sessions</a></li>
    <ul>
    <li><a href="#41-scripting-youtube-stream-management">4.1. Scripting YouTube Stream Management</a></li>
    <li><a href="#42-chat-synchronization-bot">4.2. Chat Synchronization Bot</a></li>
    <ul>
        <li><a href="#421-filtering-messages-and-users">4.2.1. Filtering Messages and Users</a></li>
        <li><a href="#422-getting-a-higher-api-quota">4.2.2. Getting a Higher API Quota</a></li>
    </ul>
    <li><a href="#43-view-count-tracking-bot">4.3. View Count Tracking Bot</a></li>
    </ul>
<li><a href="#5-reflections">5. Reflections</a></li>
    <ul>
    <li><a href="#51-issues-capturing-zoom">5.1. Issues Capturing Zoom</a></li>
    <li><a href="#52-youtube-api-traps-and-notes">5.2. YouTube API Traps and Notes</a></li>
    <li><a href="#53-amazon-ses-vs-gmail-api">5.3. Amazon SES vs. GMail API</a></li>
    <li><a href="#54-collecting-video-submissions">5.4. Collecting Video Submissions</a></li>
    <li><a href="#55-other-smaller-issues-and-notes">5.5. Other Smaller Issues and Notes</a></li>
    </ul>
<li><a href="#6-the-end">6. The End</a></li>
</ul>

# 1. Problem Overview

When held in person, VIS is a medium to large-sized conference, averaging about 1200 attendees
and taking place over 7-8 parallel sessions each day through the week.
Symposiums, workshops and tutorials are held Sunday and Monday, and during past in-person events
have pretty much free rein to structure their event how they see fit. VIS paper presentations make up the
sessions on Tuesday through Friday, with some additional events taking place after hours, e.g.,
the VIS arts program, meetups, along with a keynote on Tuesday and capstone on Friday.
When considering how to bring this event to a virtual format, we looked to EGEV 2020,
which is the most similar event to VIS and took place earlier in the year, and
to other well received virtual events (e.g., i3D, HPG, to name some that I attended this year).

A common goal in each event was to preserve the feeling of an in-person conference, while reducing
the surface area for technical issues interrupting presentations. At a high-level,
EGEV, i3D and HPG followed the same structure: presenters provided pre-recorded talks,
except in rare cases. Attendees of the conference watched
the talks through a live streaming platform (YouTube, Twitch), and asked questions over
a chat platform (Slack, Discord). Presenters would then answer the questions on the stream by
joining a Zoom call that would be streamed to YouTube/Twitch after the talk was played for Q&A.
The chair would pick questions from the chat, repeat them to the presenter on Zoom, who would then answer
them. This structure provides benefits over having all the presentations done live
or making the recorded talks available as on-demand videos with a separate
live Q&A portion:

- Recorded talks reduce the surface area for networking issues to interrupt someone's
  presentation. Technical issues can still arise with video playback, though this can be
  largely avoided by enlisting student volunteers to review the videos.
- Having the talk livestreamed to all attendees at once preserves the communal
  feeling of watching the talk together as an event.
- Directly following the talk with Q&A preserves the feeling of a live conference,
  and likely leads to a better Q&A session as the talk was just viewed by the attendees
  and is fresh on their mind.
- Streaming the event to a platform like YouTube or Twitch allows for arbitrary numbers of
  attendees at no cost.
- Having attendees watch via YouTube or Twitch avoids issues with large numbers of people in
  a Zoom call (e.g., someone forgets to mute), and allows automatically archiving the conference
  for playback.

Another goal I had was to reduce a lot of the manual effort that was required in previous
events to create the YouTube videos, Zoom meetings, Discord channels, etc. Since VIS isn't
a small event and we had time to prepare, I spent time working on various scripts to
automate this process. These have developed into [**SuperMiniStream**](https://www.superministream.com/),
and are available on [GitHub](https://github.com/superministream/virtual-conference),
where they can hopefully be of use to others. If you're interested in using SuperMiniStream
to drive your conference, get in touch!

## 1.1. Technical Platform for Streaming VIS 2020

These observations led us to decide on the following technical platform for streaming VIS 2020:

- Live streams are run on YouTube, with one video per-session of the conference. Sessions are
  90 minutes separated by 30min breaks. Workshops are single half-day sessions. This allows
  easily archiving sessions as separate YouTube videos and keeps the chat for each one distinct.
- [OBS Studio](https://obsproject.com/) is used to stream each session to YouTube. OBS Studio
  is an excellent free, open-source, cross-platform software for streaming and video recording.
- All live portions of a session (Q&A, panels, live presentations) take place over Zoom and are streamed to
  attendees on YouTube.
- Conference chat for Q&A or discussion takes place on Discord and YouTube chat. To avoid
  siloing these chat platforms they are synchronized with each other by a script.
- Each session is managed by a technician at Utah, responsible for running OBS studio,
  playing back talks, etc.
- Each stream is assigned to a computer, all of which are mirrored from a single streaming PC
  I configured and synchronize the session data via Google Drive.
  Each computer is in its own office to allow social distancing.

These choices also come with some of their own challenges. Separating each session into its own
YouTube video, Zoom call, and Discord channel, means that one of each has to be
created for each session. In total VIS 2020 had approximately 110 sessions.
By splitting the sessions up we also need to start and stop the appropriate
YouTube broadcasts during the day and migrate the stream from the computer
to the new broadcast. Finally, our choice to synchronize the chat between YouTube and Discord
required a YouTube API client with a high API quota, due to the high amount of traffic generated.

# 2. OBS Configuration

The core scenes in our OBS configuration are:

- Break: A rotation of videos, sponsor promotional information, pictures of Utah, etc.
- Session Start: A card showing the session title and schedule, with some background music.
- Session Start w/ Chair Intro: Session Start plus a capture of the Chair's video on Zoom
  so that they can introduce the next talk. The chair's video is pinned by the technician in Zoom
  to highlight it.
- VLC: A capture of VLC to stream the recorded talk as it's played back. VLC is captured using a "game capture" source in OBS.
- Zoom Q&A: A scene that captures the entire Zoom window and displays the presenter's name, presentation
  title, chair's name and some text saying "Q&A Session".
  Both the chair and presenter's videos are pinned in Zoom to shown them side by side.
- Zoom Direct/Panel: A scene that captures the entire Zoom window and displays the current
  presentation info. This is used for live panels using Zoom's gallery view mode.
- Zoom Screenshare: A capture of Zoom with two crop filters to pull out the speaker's slides and
  video to reposition them in a nicer and larger layout than they would appear in
  the Zoom Direct/Panel scene.

<div class="col-12 row mb-2">
<div class="col-6 mb-2 text-center">
	<img class="img-fluid"
		src="https://cdn.willusher.io/img/yXFNK18.webp"/>
    <b>(a)</b> <i>Session Start</i>
</div>
<div class="col-6 mb-2 text-center">
	<img class="img-fluid"
		src="https://cdn.willusher.io/img/I0eBuMM.webp"/>
    <b>(b)</b> <i>Session Start w/ Chair Intro</i>
</div>

<div class="col-6 mb-2 text-center">
	<img class="img-fluid"
		src="https://cdn.willusher.io/img/4PnWAO1.webp"/>
    <b>(c)</b> <i>Zoom Q&A</i>
</div>
<div class="col-6 mb-2 text-center">
	<img class="img-fluid"
		src="https://cdn.willusher.io/img/BYQ54sd.webp"/>
    <b>(d)</b> <i>Zoom Direct/Panel</i>
</div>
<div class="col-6 offset-3 mb-2 text-center">
	<img class="img-fluid"
		src="https://cdn.willusher.io/img/P60XBKm.webp"/>
    <b>(e)</b> <i>Zoom Screenshare</i>
</div>

<div class="col-12 offset-1">
<i><b>Figure 1:</b>Our core OBS scenes.
Break and VLC aren't shown as their output is just the video playback. Note the use
of a color key filter in the Zoom scenes to remove the Zoom window background.</i>
</div>
</div>

The key things to note here are that we make heavy use of OBS's support for text sources
reading content from files. When the content of the file changes, OBS will update
the corresponding text shown in the video output. This functionality is used for all
dynamic text shown on the stream: session title, session chair, session schedule, and
the current presentation. To allow swapping out the content being shown as the conference
progresses, these sources are configured to read from a `C:\LIVE` directory on
each machine. You can download an example of our OBS configuration
[here](https://drive.google.com/file/d/1_EOJMGQvyoTetDBcaFfSAM19r_5buW_y/view?usp=sharing).
Extract it to `C:\LIVE` and import the JSON file into OBS to try it out. If you're
on Mac or Linux some of the sources here will break, as the text and window capture
sources differ on the other OS's.

As the session progresses, the technician needs to update the current presentation
text file to match the current talk, for this to be shown correctly
at the bottom of the Zoom Q&A, Zoom Direct/Panel, and Zoom Screenshare scenes.
To make this easy for the technician, I used OBS's "Chatlog Mode" for current presentation text file input.
In Chatlog Mode, OBS will read some configurable number of lines from the bottom of the
file and display them, e.g., as you would use when livestreaming a game and displaying
chat from your subscribers on the video. However, we can also use this for the current
presentation text. When compiling the assets for each session (Section 3.6) I output the list of
presentations in _reverse_ order to a text file. This file is fed in as the text input
for the current presentation and read in chatlog mode with a line limit of 1. OBS will
then read and display the last line of the file, allowing the technician to simply delete
the last line of text as the session progresses.

Finally, to make the various Zoom captures look nice I applied a color key filter on the
Zoom window capture to remove the Zoom window background. This filter is setup in OBS
by selecting the Zoom background color to pick the color to filter (it's `#1a1a1a`).
To avoid filtering similar colors, e.g., if someone has dark hair or a dark shirt on,
I configured the filter to have a similarity and smoothness of 1 (i.e., none). The result is that
just the Zoom background color is made transparent, producing the nice looking output
shown in Figure 1c-e. To avoid showing the Zoom background in the Q&A scene we initially
had a more complicated scene that used two crop filters to capture the two pinned videos
in Zoom and position them nicely. However, this was trickier to setup for the technicians,
who had to resize the Zoom window to try and line up with the crop filters.
Using a color key gave better results and was easier for the technicians.

# 3. Scheduling the Virtual Sessions

As mentioned before, VIS 2020 took place over about 110 sessions. Each session needs
a unique YouTube broadcast, Zoom meeting, and Discord channel. Furthermore, the presenters
in each session need to receive an email containing this information.
Doing this all manually would be a significant effort and likely introduce some errors
or mix-ups in the process. However, Youtube, Zoom, and Discord all provide APIs
that we can use to create everything we need. To send emails out we can use Amazon SES.

To feed structured data into the scheduling script, and the scripts used later during the event,
the entire conference schedule is stored in an Excel workbook in a database-like format (Section 3.1).
This workbook is used by our scheduling script to create the
YouTube broadcasts (Section 3.2), Zoom Meetings (Section 3.3), and Discord
channels (Section 3.4) for each session, to email presenters
the information about their sessions (Section 3.5), and to compile
the assets needed by each streaming computer for a given session (Section 3.6).

The script that actually schedules everything is [`schedule_day.py`](https://github.com/superministream/virtual-conference/blob/main/schedule_day.py),
where the API interaction with YouTube, Zoom, and Discord is largely handled
in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py).
Schedule Day also assigns a computer to run each stream based on their availability
to ensure no computer is double-booked and no session is without a computer to run it.
Computers are identified by a single letter ID, and are also associated with a unique YouTube stream key.

## 3.1. Schedule Management with Excel and Python

The Excel workbook is structured in a "database-like" format to make it easy to
parse from a Python script using [openpyxl](https://openpyxl.readthedocs.io/en/stable/index.html),
essentially acting as a poor man's database.
You can see an example of how the sheet is formatted
[here on Google Sheets](https://docs.google.com/spreadsheets/d/1kKK0xCSkGw3JLcWwvhKxa2B9fydJbg3YZ6hU6XC0c_w/edit?usp=sharing),
also embedded below.

<div class="col-12 ratio ratio-16x9 mb-2">
    <iframe 
    src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSztlp-9FjkRQ2cR0IrREluhmBEuXmnNIpN40UY-ESMqi0TYNyGV7KM-txA4TN6yr4bWqdRUKjoc35X/pubhtml?gid=0&amp;single=true&amp;widget=true&amp;headers=false"></iframe>
</div>

Each row in the sheet corresponds to a "time slot", which is a time where something takes place during a
session: a recorded talk + Q&A, a live panel, etc.
Each row repeats its attributes even if some are the same as the row preceeding it.
This repetition is key to the "database-like" structure of the sheet and vastly
simplifies the logic of parsing it in Python. For example, instead of having an
empty "Event" entry mean that the time slot shares the value of the first non-empty one
above it, all the data for the time slot is immediately available in the row. Thus, instead
of having complicated parsing and searching logic in the script that is more susceptible to
errors introduced by reshuffling data in the sheet (e.g., a row is moved and now something
else is the first non-empty Event above it), each row can be read independently and
events, sessions and so on merged by the script using a dictionary. The extra visual
clutter is a small price to pay for the added simplicity of parsing this model.
The sheet is an internal database used only by the Technical committee,
making human readability less of a concern.

To treat the workbook like a database I implemented
[`excel_db.py`](https://github.com/superministream/virtual-conference/blob/main/core/excel_db.py)
(not to be confused with the package on PIP with the same name).
ExcelDB adds some convenience database operations on top of openpyxl.
ExcelDB treats the first row as the database index and adds functionality for:
finding rows with some attribute value, finding rows using a lambda,
fetching a row as a dictionary, appending or writing rows by passing dictionaries,
and iterating through rows.

A reasonable question at this point is "why not use an SQLite database?".
There are some motivations for using Excel instead of a real database engine:

- We can use MS Office 365 to work collaboratively on the schedule and back it up automatically using a Flow.
- Excel acts as our "application UI" for editing the database instead of having to implement something extra.
- It's easy to import schedule information and other data provided by the conference organizing committee,
  who store this information in Excel.
- We only need some basic database operations (find, group, append, update). These are easy
  enough to implement in Python on top of openpyxl.

## 3.2. YouTube

Each session needs a unique YouTube video that it will be streamed to,
which we create using the [YouTube LiveStreaming API](https://developers.google.com/youtube/v3/live/getting-started).
First, let me clarify some terminology to match the YouTube API in the following discussion:

- Broadcast: This is the YouTube video that viewers watch. It is identified by a unique ID string (shown in the video URL).
- Stream: This is the audio/video stream sent from the computer to YouTube. It is identified by a unique Key string that
  should be kept private.

A video being livestreamed on YouTube consists of two parts: the Broadcast where viewers
can watch the video and the Stream containing the data. Each Broadcast is associated with
one stream that contains the audio/video data being shown.
In this section, we will create the Broadcasts for each session using Google's Python wrapper
for the YouTube API.

To get access to the YouTube API, I created a project in Google Cloud Platform and
added the YouTube API to its API library. Whether you go through the OAuth verification
process to remove the "unverified app" screen is up to you, however it is **extremely**
important that you [request an audit](https://support.google.com/youtube/contact/yt_api_form)
of your app by YouTube. If you don't, all videos uploaded by your app (including live broadcasts after
they finish) [will be flagged as private](https://developers.google.com/youtube/v3/revision_history#release_notes_07_28_2020).

### 3.2.1. Scheduling YouTube Broadcasts

To create a Broadcast we use the [`liveBroadcasts.insert`](https://developers.google.com/youtube/v3/live/docs/liveBroadcasts/insert)
API. For each session we create a title and description for the video and determine the
start time based on the schedule sheet.
We are also required to inform YouTube if the video is made for kids or not.
The `liveBroadcasts.insert` API takes this as a parameter; however it doesn't seem to
have any effect. Instead we set this through the [`videos.update`](https://developers.google.com/youtube/v3/docs/videos/update) API.
The broadcast for each conference session is created below, within the `Session.schedule_youtube_broadcast`
member in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py).

```python
title = self.make_youtube_title()
description = self.make_youtube_description()
session_time = self.session_time()
enable_captions = "Live Captions" in self.special_notes()
# self.auth contains our authenticated credentials with the YouTube API
broadcast_info = self.auth.youtube.liveBroadcasts().insert(
   part="id,snippet,contentDetails,status",
   body={
       "contentDetails": {
           "closedCaptionsType": "closedCaptionsHttpPost" if enable_captions else "closedCaptionsDisabled",
           "enableContentEncryption": False,
           "enableDvr": True,
           # Note: YouTube requires you to have 1k subscribers and 4k public watch hours
           # to enable embedding live streams. You can set this to true if your account
           # meets this requirement and you've enabled embedding live streams, otherwise
           # you'll get an error trying to enable it.
           "enableEmbed": False,
           "enableAutoStart": False,
           "enableAutoEnd": False,
           "recordFromStart": True,
           "startWithSlate": False,
           # We must use a low latency only stream if using live captions
           "latencyPreference": "low" if enable_captions else "ultraLow",
           "monitorStream": {
               "enableMonitorStream": False,
               "broadcastStreamDelayMs": 0
           }
       },
       "snippet": {
           "title": title,
           "scheduledStartTime": session_time[0].astimezone(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.0Z"),
           "description": description,
       },
       "status": {
           "privacyStatus": "public"
       }
   }
).execute()

# Due to a bug in the Youtube Broadcast API we have to set the made for
# kids flag through the videos API separately
update_resp = self.auth.youtube.videos().update(
    part="id,contentDetails,status",
    body={
        "id": broadcast_info["id"],
        "status": {
            "selfDeclaredMadeForKids": False,
        }
    }
).execute()
```

The most important things to note here are:

- We cannot enable embedding due to YouTube's restrictions on new accounts embedding live streams.
  The VIS account did not have 1k subscribers and 4k public watch hours and thus we could not embed
  live streams on the conference webpage.
- We do not enable auto start/end, as the starting and stopping of streams will be managed separately
  by a script. Auto start allows you to make the broadcast live immediately upon receiving data at the
  stream key bound to the video, however since we assign a unique stream key to each computer instead
  of per-video we don't want to accidentally make all the broadcasts run by the computer live when we start
  the first. EGEV used the auto start setting and a separate stream key per broadcast, and mentioned issues
  with scheduling a large number of broadcasts ahead of time. I'm not sure if this was related to the auto-start
  setting or not.

### 3.2.2. Rendering Image Thumbnails with Pillow

YouTube also allows you to set the thumbnail image for the video through the API.
If you don't set a thumbnail for the video it will use your account profile picture,
which in our case was just the VIS 2020 logo. While that's ok, it'd be really cool to be able
to show the session schedule as the thumbnail. However, manually creating the
images for each of our 110 sessions (either in Photoshop or by screenshoting the scene in OBS)
is quite a lot of work. Fortunately, we can do this
in Python using [Pillow](https://pillow.readthedocs.io/en/stable/) and upload
it using the [`thumbnails.set`](https://developers.google.com/youtube/v3/docs/thumbnails/set) API!

The code to render the thumbnail image is in [`thumbnail.py`](https://github.com/superministream/virtual-conference/blob/main/core/thumbnail.py),
and takes the background image used during the stream, the session schedule info, and the
fonts to use. It then positions and draws the text over the background to closely
match the scene in OBS. A tricky thing here was getting
the text sized to fit on the image properly. The width and height of the schedule
text varies significantly between sessions depending on the number of presentations
and the lengths of their titles or author lists. To pick a font size that maximizes
the size of the text within some specified bounds I run a binary search between a set
minimum and maximum size to find the largest font size that fits the text in the bounds.

The function `render_thumbnail` returns an `io.BytesIO` object containing
the thumbnail image in PNG format to the caller, which we can set as the
video thumbnail (also done in `schedule_youtube_broadcast`):

```python
# Render the thumbnail for the session and upload it
thumbnail_img = thumbnail.render_thumbnail(thumbnail_params["background"],
        thumbnail_params["bold_font"],
        thumbnail_params["regular_font"],
        self.title_card_title(),
        self.title_card_chair(),
        self.title_card_schedule())

self.auth.youtube.thumbnails().set(
    videoId=broadcast_info["id"],
    media_body=MediaIoBaseUpload(thumbnail_img, mimetype="image/png")
).execute()
```

## 3.3. Zoom

Zoom provides [API](https://marketplace.zoom.us/docs/api-reference/zoom-api) that can
be used to create meetings, among other operations. For VIS we purchased a
Zoom Business license to also enable 1080p Group HD. Each streaming computer was
given an account with its computer ID letter used as its last name to identify them
in the script.

To schedule the Zoom meetings
I created a [JWT app](https://marketplace.zoom.us/docs/guides/build/jwt-app) on the VIS 2020 Zoom admin account.
Creating the app on the admin account allows us to use the same API key to schedule meetings for
all hosts (the other PCs).
This is the easiest path for a single-user app that you'll run locally (i.e., a Python script)
since no additional verification or OAuth screen is required. After making the JWT app
you're given an authentication token to use to authenticate your API requests.

To create a meeting we use the [Create Meeting](https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingcreate)
API. This API takes a JSON object containing the configuration of the meeting
and returns back the scheduled meeting information containing the meeting URL.
This is done in the `Session.schedule_zoom` member in
[`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py):

```python
computer = self.timeslot_entry(0, "Computer").value

headers = self.auth.zoom
r = requests.get("https://api.zoom.us/v2/users?status=active&page_size=30&page_number=1", headers=headers).json()
# Find the computer assigned to host the meeting and make them the main host, all
# others are alternative hosts. NOTE: Each computer's Zoom account is identified by
# having its last name be its computer ID letter
host = None
alternative_hosts = []
for user in r["users"]:
    if user["last_name"] == computer:
        host = user["id"]
    else:
        alternative_hosts.append(user["id"])

session_time = self.session_time()
# Zoom meetings start 15min ahead of time to set up, and can run 10min over
zoom_start = session_time[0] - self.setup_time()
zoom_end = session_time[1] + timedelta(minutes=10)
meeting_topic = CONFERENCE_NAME + ": " + self.event_session_title()
# Max Zoom meeting topic length is 200 characters
if len(meeting_topic) > 200:
    meeting_topic = meeting_topic[0:199]
# Max agenda length is 2000 characters
meeting_agenda = str(self)
if len(meeting_agenda) > 2000:
    meeting_agenda = meeting_agenda[0:1999]

meeting_info = {
    "topic": meeting_topic,
    "type": 2,
    "start_time": zoom_start.astimezone(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "timezone": "UTC",
    "duration": int((zoom_end - zoom_start).total_seconds() / 60.0),
    "password": generate_password(),
    "agenda": meeting_agenda,
    "settings": {
        "host_video": False,
        "participant_video": False,
        "join_before_host": False,
        "mute_upon_entry": True,
        "waiting_room": True,
        "audio": "both",
        "alternative_hosts": ",".join(alternative_hosts),
        "global_dial_in_countries": [
            # NOTE: Fill in dial in countries as appropriate for your conference
            "DE",
            "SE",
            "JP",
            "KR",
            "GB",
            "US",
            "CA"
        ]
    }
}

zoom_info = requests.post("https://api.zoom.us/v2/users/{}/meetings".format(host), json=meeting_info, headers=headers).json()
```

## 3.4. Discord

To create and manage the Discord channels for each session I
created a Discord bot and used [discord.py](https://discordpy.readthedocs.io/en/latest/index.html)
to access the API. The library
is very nice to work with, though is designed for people writing bots.
This makes it a bit annoying to use from "non-bot" scripts (like `schedule_day.py`)
since you can't make API calls without running an event loop.
After scheduling the YouTube broadcasts and Zoom meetings
[`schedule_day.py`](https://github.com/superministream/virtual-conference/blob/main/schedule_day.py)
starts a bot and creates the Discord channel and category (if necessary) for each session of the day.
In Discord we grouped session channels by event, with a category per event (e.g., Full Papers, Short Papers, etc.),
and the channels for sessions of that event placed within it.

The script also prints the schedule of each session as an "embed" in the channel and
pins this message. This gives attendees quick access to the schedule and YouTube link
for the session. An example of how these embeds looks is shown below. The embed
for each session is built in `Session.discord_embed_dict` in
[`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py)
and posted in the corresponding channel in `schedule_day.py`.

<div class="col-8 offset-2 mb-2 text-center">
	<img class="img-fluid" src="https://cdn.willusher.io/img/UiCgj3C.webp"/>
</div>

## 3.5. Sending Emails with Amazon SES

After scheduling everything we need to send the presenters, chairs and organizers
of each session the Zoom meeting information so that they can join for the
live portions of the stream. This means that we need to send 110 emails (one per-session) to many
more recipients (everyone presenting in each session). The best solution I found for sending
these bulk emails out from a Python script was Amazon's [Simple Email Service](https://aws.amazon.com/ses/).
I used the [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) Python SDK for AWS, which
provides a client representing the
[SES API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ses.html).
To send a nicely formatted email with the schedule and links I sent an HTML email using
the [`send_raw_email`](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ses.html#SES.Client.send_raw_email)
API.

The `send_html_email` function in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py)
takes the HTML content, recipients, attachments, and alternative plain text then builds the final email
ands sends it out. Some of the more challenging things to try
and get right here were properly attaching the plain text alternate
to reduce the "suspiciousness" level of the email and attaching
other items like the ICS file for the session and conference logo image.

```python
# recipients and cc_recipients should be lists of emails or a single email string
# attachments should be a list of MIMEBase objects, one for each attachment
def send_html_email(subject, body, recipients, email, cc_recipients=None, attachments=None, alternative_text=None):
    message = MIMEMultipart("mixed")
    message.set_charset("utf8")

    if type(recipients) == str:
        recipients = [recipients]

    if not "SUPERMINISTREAM_EMAIL_FROM" in os.environ:
        print("You must set $SUPERMINISTREAM_EMAIL_FROM to the email address to populate the from field")
        sys.exit(1)

    all_recipients = [r.strip() for r in recipients]
    message["to"] = ", ".join(recipients)
    message["from"] = os.environ["SUPERMINISTREAM_EMAIL_FROM"]

    if cc_recipients:
        if type(cc_recipients) == str:
            cc_recipients = [cc_recipients]
        message["cc"] = ", ".join(cc_recipients)
        all_recipients += [r.strip() for r in cc_recipients]

    message["subject"] = subject
    message_text = MIMEMultipart("alternative")
    if alternative_text:
        message_text.attach(MIMEText(alternative_text, "plain", "utf8"))
    message_text.attach(MIMEText(body, "html", "utf8"))
    message.attach(message_text)

    if attachments:
        for a in attachments:
            encoders.encode_base64(a)
            message.attach(a)

    response = email.send_raw_email(
        Source=message["from"],
        Destinations=all_recipients,
        RawMessage={
            "Data": message.as_bytes()
        })
    print(response)
```

In `Session.email_contributors` we generate an ICS file to send presenters that
they can add to their calendar and attach the conference logo to have a nice official
feel to the email. These both took a bit of trial and error to get attached properly,
and so I include these snippets below. They can also be found
in the `Session.email_contributors` method in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py).
The ICS files were created using the [ics](https://pypi.org/project/ics/) library in Python.

```python
# Generate the ICS calendar event attachment
calendar = self.make_calendar(with_setup_time=True, zoom_info=zoom_meeting_info)
event_attachment = MIMEBase("application", "plain")
event_attachment.set_payload(bytes(str(calendar), "utf8"))
event_attachment.add_header("Content-Disposition", "attachment",
        filename="{}.ics".format(self.event_session_title()))
attachments = [event_attachment]

# Attach the image logo if we have one
if logo_image:
    # logo_image is a raw byte array read from a file in binary mode
    attach_img = MIMEImage(logo_image)
    attach_img.add_header("Content-Disposition", "inline", filename="logo_image.png")
    attach_img.add_header("Content-ID", "<logo_image>")
    attachments.append(attach_img)
    email_body += "<img width='400' src='cid:logo_image' alt='Logo'/>"
```

## 3.6. Compiling Session Assets

The final step in scheduling each day's sessions is to build the asset bundles
for each session. Each asset bundle contains all the videos for the session along
with a playlist to play them back in order, the text input files for OBS
containing the session information, and a dashboard for the technician.
The dashboard contains the schedule, list of people who will join the Zoom meeting
to present, and links to the Zoom meeting, Discord channel, and Youtube studio
for the session. This task is done by [`compile_session_assets.py`](https://github.com/superministream/virtual-conference/blob/main/compile_session_assets.py),
which builds the session asset bundles for each day.

The output is a directory structure of `/<day>/<session start-end time>/<computer ID>/`,
where each leaf directory stores the assets that a specific computer needs
at that time for its session. When a technician is setting up to stream a session
they simply find the right day, time, and computer ID directory from a shared Google
Drive sync'd to all the streaming machines and copy the content from this
directory into `C:\LIVE`. OBS will then update the session info shown and they can
view the session schedule in the dashboard and follow the provided link to start
the Zoom meeting for presenters to join.

# 4. Running the Virtual Sessions

The result of scheduling each day with `schedule_day.py` is a YouTube broadcast,
Zoom Meeting, and Discord channel for each session. Each session is also assigned
a computer that is responsible for streaming it, where each computer has its own
stream key. In this section, we'll look at the scripts used when the sessions
are live, to manage the YouTube broadcasts (Section 4.1), synchronize
the chat (Section 4.2), and track and plot viewer statistics (Section 4.3).

## 4.1. Scripting YouTube Stream Management

One goal I had in designing the virtual conference infrastructure
was to reduce the workload placed on the technicians. The technicians already
have a lot to manage between helping presenters set up
on Zoom, playing back the videos, transitioning the OBS scenes,
and helping the chair watch the chat for questions. Taking extra work
that can be scripted off their plate, like making the Broadcasts live or offline,
will help them out.

To this end, the YouTube broadcasts were all managed by a script,
[`advance_streams.py`](https://github.com/superministream/virtual-conference/blob/main/advance_streams.py).
Advance Streams is responsible for
binding the appropriate stream keys to the broadcasts based on the schedule and making them live
when they start and taking them offline when they finish.
The script takes a `[<time end>, <time start>]` window and the schedule sheet.
Broadcasts for sessions that end within
this window will be ended, while those starting in this window will be made live.
We simply start streaming in OBS at the beginning of the day and leave it running the entire time,
with this script used to bind the streams to the appropriate sessions during the day.
During the breaks between sessions I use `advance_streams.py` to migrate
the streams of each computer to the broadcasts for the upcoming sessions.

A session is made live by binding the stream key for its computer to its broadcast
and transitioning the broadcast to be live. This is done in `Session.start_streaming`
in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py).
The method also performs some sanity checks on the state of the stream and
broadcast to ensure both are in the correct state to be made live.

```python
 def start_streaming(self):
    # The computer is assigned when scheduling the sessions in the previous section
    computer = self.timeslot_entry(0, "Computer").value
    computer_info = self.day.database.get_computer(computer)
    stream_key = computer_info["Youtube Stream Key"].value
    stream_key_id = computer_info["Youtube Stream Key ID"].value

    stream_status, stream_health = self.get_stream_status()
    broadcast_status = self.get_broadcast_status()
    # Broadcast could be in the ready state (configured and a stream key was bound),
    # or in the created state (configured but no stream key attached yet).
    if broadcast_status != "ready" and broadcast_status != "created":
        print("Broadcast {} is in state {}, and cannot be (re-)made live".format(self.youtube_broadcast_id(), broadcast_status))
        return

    if stream_status != "active":
        print("Stream on computer {} (key {}) for broadcast {} is not active (currently {}), broadcast cannot be made live".format(
            computer, stream_key, self.youtube_broadcast_id(), stream_status))
        return

    if stream_health != "good":
        print("WARNING: Stream on computer {} (key {}) is active, but not healthy. Health status is {}".format(
            computer, stream_key, stream_health))

    # Attach the stream to the broadcast
    print("Attaching stream '{}' to '{}'".format(stream_key, self.youtube_broadcast_id()))
    self.auth.youtube.liveBroadcasts().bind(
        id=self.youtube_broadcast_id(),
        part="status",
        streamId=stream_key_id,
    ).execute()

    # Make the broadcast live
    self.auth.youtube.liveBroadcasts().transition(
        broadcastStatus="live",
        id=self.youtube_broadcast_id(),
        part="status"
    ).execute()
```

A session is finished by transitioning it to the complete state and detaching the stream key
from the broadcast. Finally, we explicitly make the video embeddable, since they had
to be made not embeddable when created as live streams.
Note that detaching the key may not be necessary to do, I didn't come back to check on this.
The session is stopped by `Session.stop_streaming`
in [`schedule.py`](https://github.com/superministream/virtual-conference/blob/main/core/schedule.py).

```python
def stop_streaming(self):
    computer = self.timeslot_entry(0, "Computer").value
    broadcast_status = self.get_broadcast_status()
    if broadcast_status == "complete":
        print("Broadcast {} has already been made complete, skipping redundant transition".format(self.youtube_broadcast_id()))
        return

    if broadcast_status != "live":
        print("Broadcast {} is {}, not live, cannot make complete".format(self.youtube_broadcast_id(), broadcast_status))
        return

    # Transition broadcast to complete
    self.auth.youtube.liveBroadcasts().transition(
        broadcastStatus="complete",
        id=self.youtube_broadcast_id(),
        part="status"
    ).execute()

    # Detach the stream from this broadcast so it can be reused
    self.auth.youtube.liveBroadcasts().bind(
        id=self.youtube_broadcast_id(),
        part="status"
    ).execute()

    # Enable embedding the archived livestream, since with a new account
    # we can't embed the live stream itself
    self.auth.youtube.videos().update(
        part="id,contentDetails,status",
        body={
            "id": self.youtube_broadcast_id(),
            "status": {
                "embeddable": True,
            }
        }
    ).execute()
```

## 4.2. Chat Synchronization Bot

A common issue experienced in virtual conferences that stream to YouTube or Twitch
and use Slack or Discord for longer discussion is that, since YouTube and Twitch also
provide a small livestream chat, the conference attendees end up split between these two chat platforms.
Some attendees watch on YouTube/Twitch and discuss or ask questions in the live stream chat,
while others use Slack/Discord, and few participate in both.
This also puts additional work on presenters and session chairs, who
have to monitor two chat platforms for questions about the presentations.
We wanted to avoid this issue during VIS by somehow synchronizing the YouTube and Discord
chat platforms.

To synchronize the two platforms I wrote [`chat_sync_bot.py`](https://github.com/superministream/virtual-conference/blob/main/chat_sync_bot.py)
which uses the YouTube [liveChatMessages API](https://developers.google.com/youtube/v3/live/docs/liveChatMessages)
and [discord.py](https://discordpy.readthedocs.io/en/latest/) to synchronize the chat platforms.
When messages are posted on YouTube the bot fetches them and posts them
back to the Discord channel for that session. Similarly, when messages
are posted on Discord during the session they are posted to the YouTube live chat.
This worked really nicely during the conference, and helped us achieve our goal
of a unified chat platform. Users who didn't want to make a Discord account
could still participate fully in the discussion taking place during the session,
and presenters or chairs only had to monitor one platform for questions.

The script is a bit too long to paste here, but is available on [Github](https://github.com/superministream/virtual-conference/blob/main/chat_sync_bot.py).
The bot is started after the sessions have been made live and is given
the schedule sheet and current time. The bot then finds the YouTube broadcasts
and Discord channels that are currently active for that time in the sheet
and begins polling the YouTube live chat and monitoring the Discord channels.
The YouTube API is polled via [`liveChatMessages.list`](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list),
which returns any new messages and a time to wait before requesting new ones.
An async function is added to the Discord client's event loop for each active
YouTube broadcast to poll its chat. Messages from Discord are posted
to the live chat via the [`liveChatMessages.insert`](https://developers.google.com/youtube/v3/live/docs/liveChatMessages/insert)
API.

### 4.2.1. Filtering Messages and Users

During VIS, some attendees were surprised about the bidirectional nature of the
chat synchronization. Synchronizing the chat platforms bidirectionally is required
to provide a unified chat experience on either platform; however, some users
were not comfortable with their messages on the more private/internal Discord
channel being visible publicly on YouTube.

To address this, I initially developed a quick hack that would let attendees prefix their message
with the `-` character, thereby instructing the bot to not synchronize the message to YouTube.
There were some difficulties in also filtering out these messages if they were quoted by
another user, though this was largely addressed by filtering messages starting with `-` or `> -`.
The latter corresponds to a quoted message which the original author did not want synchronized.
Though this solution worked well for attendees who only wanted some of their messages to not be synchronized, it
was a bit fragile. During the week it also became clear that some attendees did not want
any of their messages synchronized, based on their continuous use of the `-` prefix.

Midway through the conference, I added another filtering feature to the chat synchronization bot
that allowed users to add themselves to a "no-sync" list. Once on this list, all messages
posted by them or mentioning them (i.e., quotes) would not by synchronized to YouTube.
Attendees could register themselves on this list by typing `$nosync` in our support channel,
though I think this feature was added a bit late in the week to get wide enough visibility to those who
were interested in using it.

### 4.2.2. Getting a Higher API Quota

A major concern I had about actually using the chat synchronization bot during the
conference was the large amount of API requests it would make. Each call to `liveChatMessages.list`
would cost us 1 unit, while each call to `liveChatMessages.insert` would
cost 50. By my estimate, just running the polling every second to pull messages down from YouTube
and post them to Discord would use about 173k units every day of the conference.
However, the default YouTube API limit given to new applications is just 10k units per day.
Running out of quota during the middle of the day would mean the chat sync would stop working,
as it would no longer be able to make API requests.

To request a higher API quota, the application has to go through a review process with
YouTube where you justify your request for the higher quota. This process can take
a few weeks depending on the application and how quickly you respond to their requests
for additional information. I requested a quota of 10M units based on a conservative
overestimate of how much activity there might be that we need to synchronize back
to YouTube. We requested this increase on Sep 3, and after some small corrections
were granted 5M units per day on Sep 17. This request was made on an unverified "testing"
application, when I went through the same process with
[SuperMiniStream](https://www.superministream.com/), a public application, there were more requests from the YouTube
API team that I had to fix, such as putting additional ToS and info on the app's website, and it took a bit longer (23 days).

In the end, we used significantly less API units during the conference than we had anticipated.
The 10M quota request was quite an overestimate, so when we received 5M we still felt like we were in good shape.
Our highest use during the week was 652k units on Sunday, where 8 parallel tracks run 4 sessions each.
The rest of the week had fewer parallel tracks and/or sessions, and resulted in less chat to sync.
Our API use during the week is shown below.

<div class="col-12">
<figure>
<img class="img-fluid" src="https://cdn.willusher.io/img/6cvLSz2.webp"/>
<figcaption>
<b>Figure 2:</b>
<i>Our YouTube API usage during the conference. Sunday is our largest day, with 8 parallel tracks
with 4 sessions each.</i>
</figcaption>
</figure>
</div>

## 4.3. View Count Tracking Bot

The last bot I wrote was based on a suggestion by Jason Dykes during the conference.
He asked if it would be possible to have a bot post something about the current number
of people watching a session while the session was live.

To add this feature I wrote [`track_viewer_count_bot.py`](https://github.com/superministream/virtual-conference/blob/main/track_viewer_count_bot.py).
The bot is run similar to the chat sync bot, and is given the schedule sheet and current
time. It then finds the YouTube broadcasts for the currently live sessions and posts
the viewer information to their discord channels.
The bot fetches the live stream viewer stats through the
[`videos.list`](https://developers.google.com/youtube/v3/docs/videos/list) API by requesting
`liveStreamingDetails` part:

```python
# Session.get_broadcast_statistics in schedule.py
def get_broadcast_statistics(self):
    response = self.auth.youtube.videos().list(
        id=self.youtube_broadcast_id(),
        part="liveStreamingDetails"
    ).execute()
    return response["items"][0]["liveStreamingDetails"]
```

The bot would request this information for the current live sessions every minute.
After 10 minutes had passed since it last posted an update it would plot the
viewer statistics using matplotlib, save the plot out to a PNG, and post the
image to the Discord channel for the session. To avoid filling the channel
with these plots it would also track its last message and delete it before
posting the new plot. This loop was run in an async method added to the Discord
client's event loop, and is shown below. The full code for the bot is available
on [GitHub](https://github.com/superministream/virtual-conference/blob/main/track_viewer_count_bot.py).
An example of the plot made by the bot is shown in Figure 3.

```python
# This function is run in the discord client event loop after connecting to
# the discord server.
async def update_viewer_stats():
    global last_send
    while True:
        await asyncio.sleep(60)
        current_time = datetime.now()
        elapsed = current_time - last_send
        for v, views in video_stats.items():
            video = videos[v]
            stats = video.get_broadcast_statistics()
            if "concurrentViewers" in stats:
                viewers = int(stats['concurrentViewers'])
                views.append(viewers)
            else:
                continue

            if elapsed > timedelta(minutes=10):
                last_send = current_time
                fig, ax = plt.subplots(figsize=(8, 2))
                ax.plot(list(range(len(views))), views)
                ax.set_ylabel("Viewers")
                ax.set_ylim(ymin=0, ymax=np.max(video_stats[video.youtube_broadcast_id()]) + 10)
                ax.get_xaxis().set_ticks([])
                plot_filename = video.youtube_broadcast_id() + ".png"
                fig.savefig(plot_filename, bbox_inches="tight")
                with open(plot_filename, "rb") as fp:
                    if prev_message[v]:
                        await prev_message[v].delete()
                    prev_message[v] = await channels[v].send("Viewer statistics",
                            file=discord.File(fp))
                plt.close()
                os.remove(plot_filename)

```

<div class="col-12 text-center">
<figure>
<img class="img-fluid" src="https://cdn.willusher.io/img/jEct3fA.webp"/>
<figcaption>
<b>Figure 3:</b>
<i>An example of the plot posted by the view count tracking bot.</i>
</figcaption>
</figure>
</div>

# 5. Reflections

VIS 2020 was very well received and I was really happy with how the event
turned out (I even got an award for meritorious service!). While it's hard to truly capture
a live conference in a virtual format, since things like after hours networking, hallways, parties,
are not the same in a virtual format, the event was still a ton of fun.
The less formal nature of the Discord channel and the wide
participation in it by the community helped a lot to this end.
Near the end of VIS Hendrik sent around an informal survey to solicit
feedback about what we should keep from the virtual event for future
virtual and in person events, and the Discord channel was frequently mentioned
as an item to keep. Attendees also found that asking questions on Discord
was less intimidating than stepping up the microphone during an in person event.

It would also be nice to keep some aspects of the virtual format's wider accessibility
even when we return to in person events. Being able to virtually attend any conference for
no fee (or a small one) would be great for students with funding or travel challenges.
The automatic archiving of talks is also a nice feature provided by the
virtual format that allows people to view talks after the event if the timing is inconvenient.

The rest of this section will cover some of the issues that we ran into, things that
could have been done better, and just some general notes or things to be aware of
for other people organizing the streaming aspects of a virtual conference.

## 5.1. Issues Capturing Zoom

Zoom is a nice video conference application, but is a real pain to capture with OBS Studio.
The application manages its windows and rendering in a strange way that makes
only the Window Capture mode work. We ran into additional issues due to our decision
to screenshare the presentation videos back to those in the Zoom call when playing back
the talks. This made it much easier for chairs and presenters, as they didn't need to
watch YouTube to see the talk, and made it less likely that we would have audio feedback
issues due to someone leaving YouTube unmuted during the Q&A. However, when exiting the screen
sharing and preparing the Zoom Q&A scene in OBS, the technicians would always have to toggle
the Zoom window capture on to a different application and back to Zoom to pick up the
window again. After testing all of Zoom's different rendering modes, I didn't find a way to work around
this.

I also found that Zoom does not work with OBS's Game Capture mode, as it only captures a single
person's video, and switches to the small video of yourself when someone else joins the meeting.

Finally, we decided to provide live captions for certain live sessions during the conference
to improve accessibility. All talks were required to provide subtitles with their video
which could be generated easily by editing the output of YouTube's automatic caption generation.
For live sessions we used [White Coat Captioning](https://whitecoatcaptioning.com/),
a live captioning service that specializes in technical events. Although YouTube can caption
live streams when allowing more latency, it can have issues with technical terms and quality.
I initially planned to use Zoom's caption display and simply capture this through the same
window capture to display them on the stream. However, although the captions appear to be
as part of the same window when they're displayed, they aren't captured by OBS when
using the window capture. As a result we had the captioner send their captions
directly to YouTube instead.

Hopefully these issues are resolved in future releases of OBS and Zoom.

## 5.2. YouTube API Traps and Notes

The most important issue that you **must** address is to get your application
audited and approved by YouTube. This is not the same as having Google approve
your OAuth consent screen, which is not required for the YouTube API audit.
As mentioned above, your app must have been audited to be able to upload videos
or make the archived live stream videos publicly available. This is due
to [a recent policy change in the YouTube API](https://developers.google.com/youtube/v3/revision_history#release_notes_07_28_2020).
If you don't have the application reviewed your videos and archived live stream
videos will be forced private for a ToS violation. Requesting and being approved
for a higher API quota also counts as an audit, so you only need to do one (request audit or higher quota).

YouTube enforces some limits on the number of live streams that you can schedule each day,
which is lower than the number of videos you can upload each day. I found that
we could schedule 30 live streams each day, though did not hit a limit on the
total number of live streams we could have scheduled (I tested up to ~180).
The 30 live stream limit also counts against your video upload limit, for example,
after scheduling 30 live streams you could upload 70 videos. I didn't have time to
test, but uploading videos may count against the live stream limit as well,
e.g., after uploading 100 videos (the max per day for accounts with less than ~2k videos)
you would probably not be able to schedule any live streams that day.

The audit process can take a few weeks, if you plan to go this route I recommend making the audit
or quota increase request far ahead of your event to ensure it will be completed in time.

It's also important to be aware that if you make a new account for your
conference, you likely won't be able to embed the live stream videos on
your website. Unfortunately, embedding live streams requires 1k subscribers and 4k public
watch hours on the account, after which you have to enable monetization to
enable embedding live streams. The videos
will be embeddable after they're streamed though.

We also had some issues with the display of live captions on YouTube,
where they would flash up for a half second and disappear. From talking
to the captioner it sounds like this is a common issue with live captions
on YouTube. Fortunately they also provided a separate text output stream
for attendees to view the captions.

## 5.3. Amazon SES vs. GMail API

I initially used the GMail API to try sending emails out from my personal GMail.
However, since the app's OAuth screen wasn't approved by Google, the emails were
flagged with a "suspicious email" warning by GMail. Making a public app that
can access the GMail API requires a more extensive verification process
because it accesses [restricted scopes](https://developers.google.com/drive/api/v3/reference/files/get).
The guide also mentions a possible independent security audit, though I don't think this
applies to a Python script run locally.
An internal application to a G-Suite account can get around this and not need
the consent screen to be verified; however, new G-Suite accounts are still restricted
to 500 emails per day until they've paid $30 in their subscription. New G-Suite accounts also have
a low reputation score on their emails. After struggling against these G-Suite restrictions and
having emails seem to get stuck sending for hours or route to spam, I decided to try
[Amazon's Simple Email Service](https://aws.amazon.com/ses/).

This issue came up very late, when we were trying to send out registration information to
attendees and session information to participants. Having these emails get delayed or lost
was really concerning. Fortunately, migrating to Amazon SES and getting approved to move out
of the testing sandbox only took a day and we were able to get these emails out to people.
My recommendation here is to not bother with the GMail API and just use Amazon SES.
The sender IPs have a high reputation to start and you're given
a much higher sending limit (we were granted 50k). The API for building the email is the same
as you use the [Python email module](https://docs.python.org/3/library/email.html) to build it, so the difficulty of
using either is the same and it's easy to swap between them.
SES is also quite cheap, at $0.10 per 1000 emails our total cost for VIS was $0.40.

## 5.4. Collecting Video Submissions

Another aspect that I think could have worked better was collecting the video submissions
from presenters. We set some naming conventions to be used to help us
uniquely identify each talk, though this got a bit mixed up on the final submission
site. IEEE set up an FTP server for folks to upload to and provided slightly
different guidance on the naming convention (though this naming convention was also fine).
However, the FTP server isn't able to enforce any specific naming convention. The result
was that a variety of file naming patterns were used (ours, IEEE's, and others) making it a bit
harder to sort through the video submissions (some more flexible regex did the trick).
Some presenters also had issues uploading to the FTP, either with file corruption or just general
difficulty accessing it.

My recommendation would be to use a Google Form to collect
the presentation videos. Google Forms can accept file uploads and will save the
uploaded files out to the account's Google Drive. The Google Form can also output
an Excel sheet with a row per response containing the form info and Drive links for each file.
You can then write a script using openpyxl to parse the data and use the Google Drive
[files.get](https://developers.google.com/drive/api/v3/reference/files/get) API to retrieve
the file name and look up the local path in your sync'd Google Drive folder to organize
the videos. Note that the Google Drive API is also a restricted API (i.e., requiring
a more extensive verification process). However, you can register a G-Suite account
and make this script an internal app to avoid needing this review. A business standard
account is $12/user/month and comes with 2TB of Drive storage per user, which should
be plenty of space to store the videos. You'll also want to
increase the max file upload space allowed to be used by the form.

## 5.5. Other Smaller Issues and Notes

Another bot I implemented but didn't discuss or add to the public code release was a polling
system bot. Users could start new polls and add or vote on questions using the bot.
However, this adds a lot of overhead to asking a question, since users need to learn how
to use this bot. In the end this bot was not used at all during the conference, and I think
this was for the best. The chairs and technicians were able to pick up the questions from the
chat without too much difficulty. However, I would recommend that attendees practice "clap etiquette"
in the future. Instead of everyone posting 👏 as a message in the channel, and thus flooding
the channel with applause, it works much better to have everyone use the emoji as a reaction
on a single clap post (either made by the chair or the first few posted).

As part of the video review process we used the VIS student volunteers to check the videos
for errors. I wrote [`assign_sv_videos.py`](https://github.com/superministream/virtual-conference/blob/main/assign_sv_videos.py)
to check for basic encoding errors (correct resolution, format), and create bundles
of those passing this check to distribute to SVs for review. We did catch a few videos
with errors in this way, e.g., where the audio would cut out at slide transitions.
If possible, I would recommend performing a manual review of the videos. Playing them back
at ~1.5x speed was enough to still pick up on any issues.

Also on the topic of videos, is audio normalization or compression. When faced with
a large number of videos (over 200 for VIS across all events) recorded in a huge
variety of environments and with widely varying audio quality, this is not an easy task.
For VIS 2020, I was hesitant to start messing with the audio of all the videos out of
concern that I would introduce errors in some without time for a re-review by the SVs to catch these.
Alex and Martin mentioned that a colleague of theirs who has experience with audio
processing tried this for a few days for EGEV 2020 and didn't have very good results,
due to the wide variation in recording quality. Unfortunately this results in the
volume level being inconsistent during the conference, requiring the technicians
to adjust it on the fly. If there is a reliable route to compressing/normalizing
audio for hundreds of videos recorded in widely varying environments, I'd be interested
to know about it, as this issue will be faced by many virtual conferences through
the next year.

My recommendation to presenters is to purchase a good microphone if possible,
and to be close to the mic when recording your audio. If you're not able to
pick up a high-quality mic, you can still get pretty good results doing
some noise filtering and compression in [Audacity](https://www.audacityteam.org/) (free software).

To encourage informal discussion we created a few "hallway" voice chat channels,
suggested by someone attending UIST 2020 which had a similar setup. We created 10
voice channels with a 10 person capacity and a few with a 20 person capacity
to encourage small to medium size groups of people to chat. These were open to
all attendees the entire conference for any informal discussion or after hours
socializing and were pretty popular. I'd recommend providing this to attendees
for other virtual events in the future.

If you'll be having students volunteer as technicians to run the streams during
the conference I strongly recommend doing a training session with them to familiarize
them with the software before the event. While it isn't too complex a task, it is not
something that can be figured out in 30 minutes before the session starts. I recorded a
demo video for the technicians and organized small training groups which took place
the week before VIS to familiarize the technicians with the setup.

# 6. The End

This post covers the key parts of the virtual conference streaming infrastructure
and my experience with VIS 2020. Of course a lot more went on behind the scenes
than is discussed here, but if I try to fit everything in this post would
be enormous and I'd probably never finish writing it. So feel free to get in touch
if you have other questions that aren't answered here, in the documentation
on [Github](https://github.com/superministream/virtual-conference) or the demo
video about [SuperMiniStream](https://youtu.be/wDZnmMAWsbU).
Also be sure to check out [Alper's write up about the virtual conference webpage](https://alper.datav.is/blog/2020/11/virtual-ieee-vis-website/)!
