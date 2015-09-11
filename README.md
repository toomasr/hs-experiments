HelpScout Experiments
=========================

Every now and then I need to whip up some custom JavaScript to look into some [HelpScout](http://www.helpscout.net/) metric or aspect that is not in the UI necessarily. I took one of those and made it available for others. Feel free to use it on the [Github Page](http://toomasr.github.io/hs-experiments/) or just clone the repository and use it offline.

Time to First Response
=========================

The HelpScout web interface can show you your average time to first response. This is the time between when an email came into the mailbox and when you first replied to that email. Sometimes you need to dig a bit deeper to understand which cases exactly bring your average down.

This is the tool that does that. Once you enter the API key it will fetch all the mailboxes you have access to. Then when you click on a mailbox it will download the messages for the current month and calculate the time to first response. Then it will list all the cases sorted by the time to first response.

You are ready to analyse the cases one by one :). See the demo at the [Github Page](http://toomasr.github.io/hs-experiments/) or clone the repository for more offline experience.
