import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, Loader2, FileText, Video, Camera, MessageCircle, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

type Platform = "YouTube Script" | "Instagram Caption" | "Facebook Post" | "Twitter Thread";
type Tone = "Professional" | "Funny" | "Inspirational" | "Controversial" | "Educational";

const platformIcons: Record<Platform, typeof Video> = {
  "YouTube Script": Video,
  "Instagram Caption": Camera,
  "Facebook Post": MessageCircle,
  "Twitter Thread": Twitter,
};

function generateMockContent(topic: string, platform: Platform, tone: Tone): string {
  const t = topic.trim() || "your topic";

  const templates: Record<Platform, Record<Tone, string>> = {
    "YouTube Script": {
      Professional: `TITLE: The Complete Guide to ${t} - Everything You Need to Know

INTRO:
Welcome back to the channel. Today we're diving deep into ${t}. Whether you're a beginner or an experienced professional, this video will give you actionable insights you can apply immediately.

SECTION 1 - Why ${t} Matters:
Let's start with the fundamentals. ${t} has become one of the most important topics in its field, and here's why...

SECTION 2 - Key Strategies:
Now let's break down the top strategies that industry leaders are using right now to leverage ${t} effectively...

SECTION 3 - Common Mistakes to Avoid:
Before we wrap up, let me share the three biggest mistakes people make when approaching ${t}, and how you can avoid them...

OUTRO:
That's everything you need to know about ${t}. If this video helped you, hit that like button and subscribe for more content like this. Drop a comment below telling me your experience with ${t}. See you in the next one.

#${t.replace(/\s+/g, "")} #Tutorial #Guide`,

      Funny: `TITLE: I Tried ${t} So You Don't Have To (It Was a Disaster)

INTRO:
What's up everyone! So... I made a terrible decision. I decided to try ${t}. Spoiler alert: it did not go as planned. But hey, at least you'll get a good laugh out of my suffering.

THE SETUP:
So it all started when I was scrolling through the internet at 3 AM -- as one does -- and I stumbled across ${t}. My first thought? "How hard can it be?" Famous last words, am I right?

THE ATTEMPT:
*cuts to montage of everything going wrong*
Okay so turns out ${t} is WAY harder than those influencers make it look. Nobody warned me about any of this...

THE AFTERMATH:
Long story short, my dignity is in shambles but at least I learned something. And that something is: maybe leave ${t} to the professionals.

OUTRO:
If you enjoyed watching me struggle, smash that subscribe button. And let me know in the comments -- have YOU ever tried ${t}? How badly did it go?

#Funny #Fail #${t.replace(/\s+/g, "")}`,

      Inspirational: `TITLE: How ${t} Changed My Life Forever

INTRO:
Everyone has that one moment that changes everything. For me, it was discovering ${t}. Today, I want to share my journey with you -- because I believe this could change your life too.

MY STORY:
A year ago, I was stuck. I had no direction, no motivation, and honestly, no hope. Then I discovered ${t}. At first, I was skeptical. But something told me to keep going...

THE TURNING POINT:
The moment everything clicked was when I realized that ${t} isn't just a skill or a hobby -- it's a mindset. It taught me discipline, patience, and most importantly, to believe in myself.

YOUR TURN:
I'm not special. I'm not extraordinarily talented. If I can transform my life through ${t}, so can you. The only thing standing between you and your dreams is the decision to start.

OUTRO:
Remember: every expert was once a beginner. Start your ${t} journey today. Subscribe and join this community of people who refuse to settle for ordinary.

#Motivation #${t.replace(/\s+/g, "")} #NeverGiveUp`,

      Controversial: `TITLE: The Uncomfortable Truth About ${t} Nobody Wants to Hear

INTRO:
Today I'm going to say what everyone is thinking but nobody has the guts to say out loud. ${t} is NOT what people are telling you it is. And I have the receipts to prove it.

THE PROBLEM:
The mainstream narrative around ${t} is fundamentally flawed. Here's why: most of what you've been told is either outdated, oversimplified, or flat out wrong. Let me break it down...

THE EVIDENCE:
Look at the data. Look at what's actually happening versus what influencers and media outlets are claiming about ${t}. The gap between reality and perception is massive.

THE REAL SOLUTION:
Instead of following the crowd, here's what you should actually be doing about ${t}. This approach might be unpopular, but it's backed by evidence and real results.

OUTRO:
I know this take is going to ruffle some feathers. But I'd rather tell you the truth about ${t} than sell you a comfortable lie. Let me know in the comments if you agree or disagree.

#Truth #${t.replace(/\s+/g, "")} #RealTalk`,

      Educational: `TITLE: ${t} Explained - A Beginner's Complete Guide

INTRO:
Hello and welcome. Today we're going to break down ${t} from the ground up. By the end of this video, you'll have a solid understanding of the fundamentals and be ready to take your first steps.

CHAPTER 1 - What is ${t}?
Let's start with the basics. ${t} can be defined as... [detailed definition]. It originated from... and has evolved significantly over the years.

CHAPTER 2 - How Does ${t} Work?
Now that we understand what ${t} is, let's look at the mechanics. There are three core principles you need to understand...

CHAPTER 3 - Getting Started with ${t}:
Here's a step-by-step framework for beginners:
1. Start by understanding the fundamentals
2. Practice with small, manageable projects
3. Seek feedback from experienced practitioners
4. Scale up gradually as your confidence grows

CHAPTER 4 - Resources:
Here are the top resources I recommend for learning more about ${t}:
- Books: [Top 3 recommendations]
- Online courses: [Best platforms]
- Communities: [Where to connect with others]

OUTRO:
That covers the essentials of ${t}. Remember, learning is a journey, not a destination. Subscribe for more educational content and leave your questions in the comments.

#Education #${t.replace(/\s+/g, "")} #LearnSomethingNew`,
    },
    "Instagram Caption": {
      Professional: `The key to success in ${t} isn't luck -- it's strategy, consistency, and an unwavering commitment to excellence.

Here are 3 principles that have transformed my approach:

1. Start with clarity of purpose
2. Execute with precision and patience
3. Measure, adapt, and iterate

The results speak for themselves.

What's your biggest takeaway when it comes to ${t}? Share below.

#${t.replace(/\s+/g, "")} #Success #BusinessMindset #ProfessionalGrowth #Strategy #Leadership #Hustle #Grind #Results #Entrepreneur`,

      Funny: `Me: I'm going to master ${t} this year.

Also me: *watches 47 tutorials, buys all the gear, takes a nap instead*

Can someone please explain why ${t} looked so easy on the internet but feels like rocket science in real life?

Asking for a friend. The friend is me.

Tag someone who promised to start ${t} with you but backed out immediately.

#Relatable #${t.replace(/\s+/g, "")} #Fail #Humor #TooReal #SendHelp #WeekendVibes`,

      Inspirational: `They told me ${t} was impossible.

They said I was wasting my time. That it would never work. That I should just "be realistic."

But I kept going. Day after day. Through the doubt, the setbacks, and the silence.

And now? Now they ask me how I did it.

The answer is simple: I never stopped believing that ${t} was worth fighting for.

Your journey matters. Keep going.

#${t.replace(/\s+/g, "")} #NeverGiveUp #Motivation #DreamBig #KeepGoing #BelieveInYourself #Success #Inspiration`,

      Controversial: `Hot take: Most people are approaching ${t} completely wrong.

I know this is going to upset some people, but someone needs to say it.

The "conventional wisdom" around ${t} is keeping you stuck. Here's what actually works:

Stop following trends blindly.
Start questioning everything you've been told.
Do the research yourself.

Agree or disagree? I want to hear your honest thoughts.

#${t.replace(/\s+/g, "")} #HotTake #Unpopular #Truth #RealTalk #ThinkDifferent`,

      Educational: `Did you know this about ${t}? Most people don't.

Here are 5 facts that will change how you think about it:

1. It's been around longer than most people realize
2. The fundamentals are simpler than they appear
3. Consistency matters more than intensity
4. Small improvements compound over time
5. The best time to start was yesterday -- the second best is now

Save this post for later and share it with someone who needs to see it.

#${t.replace(/\s+/g, "")} #DidYouKnow #LearnSomethingNew #Education #Facts #Knowledge`,
    },
    "Facebook Post": {
      Professional: `Exciting update on my journey with ${t}:

After months of hard work and dedication, I'm thrilled to share some major progress. Here's what I've learned along the way:

The biggest lesson? Success with ${t} doesn't happen overnight. It takes patience, strategic thinking, and surrounding yourself with the right people.

I want to thank everyone who has supported me through this journey. Your encouragement has meant more than you know.

For anyone considering getting into ${t} -- my advice is simple: start now, stay consistent, and don't be afraid to ask for help.

What's your experience with ${t}? I'd love to hear your stories in the comments.`,

      Funny: `Alright friends, I need to confess something.

I tried ${t} for the first time today and... let's just say it didn't go according to plan.

You know those "What I expected vs What I got" memes? Yeah. That was my entire experience.

Step 1: Watch a 10-minute tutorial. Feel confident.
Step 2: Attempt ${t}. Immediately regret all life choices.
Step 3: Consider changing my identity and moving to another country.

But hey, at least I can laugh about it now! (Please laugh with me, not at me.)

Has anyone else had a similar experience? Please tell me I'm not alone.`,

      Inspirational: `I want to share something personal today.

A year ago, I knew nothing about ${t}. Zero. Nada. I was starting from absolute scratch with no experience and no connections.

Today? I can honestly say it was the best decision I ever made.

The road wasn't easy. There were days I wanted to quit. Days where nothing seemed to work. Days where I questioned everything.

But I kept showing up. And slowly, things started to change.

If you're at the beginning of your ${t} journey and feeling overwhelmed -- just know that every single expert started exactly where you are right now.

Keep going. Your breakthrough is closer than you think.

Share this with someone who needs to hear it today.`,

      Controversial: `I'm going to say something that might be unpopular, but I think it needs to be said:

The way most people approach ${t} is fundamentally broken.

We've been told to follow a certain path, use certain strategies, and accept certain "truths" -- but the data tells a completely different story.

I've spent the last few months researching ${t} extensively, and what I found challenged everything I thought I knew.

The conventional approach is failing the majority of people who try it. And the people who succeed? They're doing the exact opposite of what mainstream advice suggests.

I'm not trying to be contrarian for the sake of it. I genuinely want to start a conversation about this.

What do you think? Am I off base, or have you noticed this too?`,

      Educational: `Let's talk about ${t} -- because I think there's a lot of misinformation out there.

Here's a quick breakdown of what you actually need to know:

WHAT IT IS:
${t} is essentially a framework/approach/skill that allows you to [core benefit]. It's been gaining attention recently, and for good reason.

WHY IT MATTERS:
Understanding ${t} can help you make better decisions, save time, and achieve results that would otherwise take much longer through traditional methods.

HOW TO GET STARTED:
1. Learn the fundamentals first (don't skip this step)
2. Find a mentor or community for accountability
3. Start small and build momentum
4. Track your progress and adjust as needed

COMMON MISTAKES:
- Trying to do too much too fast
- Ignoring the basics
- Not asking for help when stuck

Save this post and share it with anyone who might find it useful!`,
    },
    "Twitter Thread": {
      Professional: `THREAD: Everything I know about ${t} after years of experience.

A comprehensive breakdown you'll want to bookmark. Let's dive in:

1/ First, let's address the elephant in the room: most advice about ${t} is surface-level at best. Here's what the experts won't tell you...

2/ The foundation of success with ${t} comes down to three things:
- Clarity of vision
- Consistent execution
- Ruthless prioritization

3/ Mistake #1 that people make: Trying to do everything at once. Focus on ONE aspect of ${t} and master it before moving on.

4/ Mistake #2: Comparing your beginning to someone else's middle. Everyone's ${t} journey is different. Focus on YOUR progress.

5/ The strategy that changed everything for me: Instead of following trends, I studied the fundamentals of ${t} and built from there.

6/ Here's the framework I use daily:
- Morning: Plan and prioritize
- Afternoon: Execute and create
- Evening: Review and optimize

7/ Resources that helped me the most:
- Reading extensively about ${t}
- Connecting with practitioners
- Testing and iterating constantly

8/ Final thought: The best time to start with ${t} was a year ago. The second best time is right now.

If this thread was valuable, repost it to help others on their ${t} journey.`,

      Funny: `THREAD: My attempt at ${t} -- a tragedy in 7 parts.

Buckle up, this gets embarrassing fast:

1/ Day 1 of learning ${t}: Watched a YouTube video. Felt like a genius. Told everyone I knew. Updated my bio. The confidence was astronomical.

2/ Day 2: Actually tried ${t}. Immediately understood why the video had a "Don't try this at home" energy.

3/ Day 3: Googled "is ${t} actually possible or is the internet lying to me." The internet was, in fact, lying.

4/ Day 5: Brief moment of hope! Something actually worked! I celebrated like I won an Olympic gold medal. It was literally the bare minimum.

5/ Day 7: Back to square one. Considered a career change. Maybe I should just become a plant. Plants don't need to learn ${t}.

6/ Day 14: Plot twist -- I actually started getting the hang of it. Not GOOD, mind you. Just... less terrible. Progress!

7/ Today: Still figuring out ${t} one disaster at a time. If you see me struggling, please just wave and keep walking.

Who else has had this experience? Quote tweet with your own ${t} disaster story.`,

      Inspirational: `THREAD: How ${t} completely transformed my perspective.

A story I've never shared publicly before:

1/ Two years ago, I hit rock bottom. I had no direction, no motivation, and honestly, I was ready to give up on everything. Then ${t} entered my life.

2/ I won't pretend it was love at first sight. ${t} was hard. Really hard. There were days I cried from frustration and nights I couldn't sleep from doubt.

3/ But something kept pulling me back. A small voice that said "just try one more time." So I did. Again and again and again.

4/ The turning point came when I stopped comparing myself to others. ${t} isn't a competition. It's a personal journey of growth.

5/ Month by month, I saw progress. Small wins that became bigger wins. Confidence that replaced doubt. Purpose that replaced confusion.

6/ Today, ${t} isn't just something I do. It's who I am. It taught me resilience, patience, and the power of showing up even when no one is watching.

7/ To anyone who's struggling right now: Your ${t} breakthrough is coming. Don't give up. The world needs what only you can create.

If this resonated with you, save this thread and come back to it when you need a reminder.`,

      Controversial: `THREAD: The uncomfortable truth about ${t} that the industry doesn't want you to know.

This might get me cancelled, but here goes:

1/ The ${t} industry is built on a lie. A profitable, well-marketed lie. And most people are too deep in it to see it clearly.

2/ Lie #1: "Anyone can succeed at ${t} if they just work hard enough." Reality: The system is designed to benefit a select few while keeping the majority stuck.

3/ Lie #2: "You need to invest thousands of dollars to learn ${t} properly." Reality: 90% of what you need is available for free if you know where to look.

4/ Lie #3: "The experts have it all figured out." Reality: Most "experts" in ${t} are just better marketers, not better practitioners.

5/ So what's the actual path forward? Independent thinking. Question everything. Test for yourself. Don't take anyone's word as gospel -- including mine.

6/ The people who truly succeed at ${t} are the ones who think critically, challenge assumptions, and carve their own path instead of following a script.

7/ I'm not saying burn the whole system down. I'm saying: open your eyes, do your own research, and make informed decisions about ${t}.

Agree? Disagree? Quote tweet this with your honest take.`,

      Educational: `THREAD: A complete beginner's guide to ${t}.

Everything you need to know, explained simply. Bookmark this:

1/ What is ${t}? Simply put, it's [core definition]. Think of it as a framework that helps you [key benefit]. It's been growing rapidly in recent years.

2/ Why should you care about ${t}? Because it directly impacts [area of life/work]. Understanding the basics can give you a significant advantage.

3/ The history: ${t} has been around since [approximate origin]. It evolved from [predecessor] and has gone through several major shifts.

4/ Core principles of ${t}:
- Principle 1: Start with fundamentals
- Principle 2: Practice consistently
- Principle 3: Seek feedback early and often

5/ Common misconceptions about ${t}:
MYTH: You need to be an expert to start
TRUTH: Everyone starts as a beginner

MYTH: It takes years to see results
TRUTH: Small wins come faster than you think

6/ Getting started today:
Step 1: Learn the vocabulary
Step 2: Study successful examples
Step 3: Start with a small project
Step 4: Join a community for support

7/ Best resources for learning ${t}:
- Free: YouTube tutorials, blog posts, forums
- Paid: Online courses, books, mentorship programs
- Community: Discord servers, subreddits, local meetups

Save this thread and share it with someone starting their ${t} journey.`,
    },
  };

  return templates[platform]?.[tone] || `Here is your ${tone.toLowerCase()} content about ${t} for ${platform}.\n\nStay tuned for more!`;
}

export default function AIContentGenerator() {
  const [topic, setTopic] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [platform, setPlatform] = useState<Platform | "">("");
  const [tone, setTone] = useState<Tone | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", description: "Tell us what your content is about.", variant: "destructive" });
      return;
    }
    if (!platform) {
      toast({ title: "Please select a platform", description: "Choose the content format you want to generate.", variant: "destructive" });
      return;
    }
    if (!tone) {
      toast({ title: "Please select a tone", description: "Choose the tone for your content.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult("");
    setCopied(false);

    setTimeout(() => {
      const content = generateMockContent(topic, platform as Platform, tone as Tone);
      setResult(content);
      setIsLoading(false);
      toast({ title: "Content generated successfully!", description: `Your ${platform} content is ready.` });
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const PlatformIcon = platform ? platformIcons[platform as Platform] : FileText;

  return (
    <ToolPageLayout
      title="AI Content Generator"
      description="Generate viral social media content for YouTube, Instagram, Facebook, and Twitter with AI-powered templates."
      toolPath="/ai-content-generator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter the topic or subject you want to create content about.</li>
          <li>Select the platform format (YouTube Script, Instagram Caption, Facebook Post, or Twitter Thread).</li>
          <li>Choose the tone (Professional, Funny, Inspirational, Controversial, or Educational).</li>
          <li>Click "Generate Content" and wait for your content to appear.</li>
          <li>Click "Copy to Clipboard" to copy the generated content.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-section-config">
            <PlatformIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Configuration</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-platform">Content Format</label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger data-testid="select-platform">
                <SelectValue placeholder="Choose a format..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YouTube Script">YouTube Script</SelectItem>
                <SelectItem value="Instagram Caption">Instagram Caption</SelectItem>
                <SelectItem value="Facebook Post">Facebook Post</SelectItem>
                <SelectItem value="Twitter Thread">Twitter Thread</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-tone">Tone</label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger data-testid="select-tone">
                <SelectValue placeholder="Choose a tone..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Funny">Funny</SelectItem>
                <SelectItem value="Inspirational">Inspirational</SelectItem>
                <SelectItem value="Controversial">Controversial</SelectItem>
                <SelectItem value="Educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2" data-testid="text-about-title">About</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate platform-optimized content with the right tone for your audience. Each format is tailored to match platform best practices and maximize engagement.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-section-generate">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Generate Viral Content</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="topic-input" data-testid="label-topic">
              What is your content about?
            </label>
            <Textarea
              id="topic-input"
              placeholder="e.g., Remote work productivity tips, Starting a small bakery, Learning to code in 2025..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              data-testid="input-topic"
            />
          </div>

          <Button
            className="w-full"
            onClick={() => requestAction(handleGenerate)}
            disabled={isLoading}
            data-testid="button-generate"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Crafting your viral content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Your generated content will appear here.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Select a format, tone, and topic to get started.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-loading-state">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Crafting your viral content...</p>
            </div>
          )}

          {result && !isLoading && (
            <Card data-testid="card-result">
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-2 flex-wrap p-4 pb-0">
                  <div className="flex items-center gap-2">
                    {platform && (() => {
                      const Icon = platformIcons[platform as Platform];
                      return <Icon className="w-4 h-4 text-muted-foreground" />;
                    })()}
                    <span className="text-sm font-medium text-muted-foreground" data-testid="text-result-label">
                      {platform} - {tone}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    data-testid="button-copy"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4">
                  <pre
                    className="whitespace-pre-wrap font-mono text-sm text-foreground bg-muted/50 rounded-md p-4 overflow-auto max-h-[500px] leading-relaxed"
                    data-testid="text-result-content"
                  >
                    {result}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="AI Content Generator"
      />
    </ToolPageLayout>
  );
}