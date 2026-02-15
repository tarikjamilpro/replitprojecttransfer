import { useState, useMemo, useCallback, useEffect } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarDays, List, ChevronLeft, ChevronRight, Plus, X, Search,
  Download, Lightbulb, Star, Trash2, Bell, PartyPopper, Heart,
  Gift, Music, Sparkles, Sun, Moon, Leaf, Snowflake, Flower2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Holiday {
  date: string;
  name: string;
  description: string;
  socialTip: string;
  isCustom?: boolean;
}

const MOCK_HOLIDAYS: Holiday[] = [
  { date: "01-01", name: "New Year's Day", description: "First day of the new year, fresh starts and new resolutions", socialTip: "Share New Year goals, behind-the-scenes of celebrations, or a year recap post" },
  { date: "01-15", name: "Martin Luther King Jr. Day", description: "Honoring the civil rights leader and his legacy", socialTip: "Share an inspiring quote, educate your audience on history, or highlight community impact" },
  { date: "01-21", name: "National Hug Day", description: "A day dedicated to the power of hugs and human connection", socialTip: "Post heartwarming team photos or share a thank-you message to your community" },
  { date: "01-24", name: "International Day of Education", description: "Celebrating the role of education for peace and development", socialTip: "Share a learning tip, book recommendation, or educational content in your niche" },
  { date: "01-28", name: "Data Privacy Day", description: "Raising awareness about data protection and privacy", socialTip: "Share data safety tips relevant to your audience or industry insights" },

  { date: "02-02", name: "Groundhog Day", description: "A fun tradition predicting the arrival of spring", socialTip: "Create a playful poll or prediction post related to your industry" },
  { date: "02-04", name: "World Cancer Day", description: "Raising awareness and encouraging cancer prevention", socialTip: "Share supportive content, resources, or a story of strength and resilience" },
  { date: "02-11", name: "International Day of Women and Girls in Science", description: "Promoting women and girls in science fields", socialTip: "Highlight inspiring women in your industry or share educational content" },
  { date: "02-14", name: "Valentine's Day", description: "A day celebrating love, friendship, and appreciation", socialTip: "Run a giveaway, share customer love stories, or post appreciation content" },
  { date: "02-20", name: "World Day of Social Justice", description: "Promoting social justice and equal opportunity", socialTip: "Share your brand values or highlight a cause you support" },

  { date: "03-01", name: "Zero Discrimination Day", description: "Promoting equality and inclusion worldwide", socialTip: "Share stories of diversity in your team or community inclusion efforts" },
  { date: "03-08", name: "International Women's Day", description: "Celebrating achievements of women globally", socialTip: "Feature women leaders, share empowering stories, or spotlight female team members" },
  { date: "03-14", name: "Pi Day", description: "Celebrating mathematics and the number pi (3.14)", socialTip: "Share a fun math fact, a pie photo, or a creative number-themed post" },
  { date: "03-17", name: "St. Patrick's Day", description: "Irish cultural celebration with green themes", socialTip: "Create green-themed content, share lucky deals, or post festive behind-the-scenes" },
  { date: "03-20", name: "International Day of Happiness", description: "Promoting happiness as a fundamental human goal", socialTip: "Share what makes your team happy, run a positivity campaign, or highlight joyful moments" },
  { date: "03-22", name: "World Water Day", description: "Focusing attention on the importance of freshwater", socialTip: "Share sustainability tips or your brand's eco-friendly initiatives" },

  { date: "04-01", name: "April Fools' Day", description: "A day for pranks, jokes, and lighthearted fun", socialTip: "Create a funny fake product announcement or a playful prank post" },
  { date: "04-07", name: "World Health Day", description: "Focusing on global health awareness", socialTip: "Share wellness tips, healthy workplace practices, or team fitness content" },
  { date: "04-12", name: "International Day of Human Space Flight", description: "Celebrating humanity's journey to space", socialTip: "Create aspirational content about pushing boundaries or exploring new frontiers" },
  { date: "04-22", name: "Earth Day", description: "Annual event to demonstrate support for environmental protection", socialTip: "Showcase sustainability efforts, share eco tips, or launch a green initiative" },
  { date: "04-23", name: "World Book Day", description: "Promoting reading, publishing, and copyright", socialTip: "Share book recommendations from your team or create a reading list for your niche" },

  { date: "05-01", name: "International Workers' Day", description: "Celebrating workers and the labor movement worldwide", socialTip: "Appreciate your team, share workplace culture posts, or highlight employee stories" },
  { date: "05-04", name: "Star Wars Day", description: "May the Fourth be with you - celebrating Star Wars", socialTip: "Create themed content with sci-fi references or fun team photos with props" },
  { date: "05-12", name: "Mother's Day", description: "Honoring mothers and motherhood", socialTip: "Share heartfelt tributes, run gift-related promotions, or highlight working moms on your team" },
  { date: "05-17", name: "World Telecommunication Day", description: "Raising awareness of digital communication", socialTip: "Share how technology shapes your business or post digital transformation tips" },
  { date: "05-25", name: "National Wine Day", description: "Celebrating wine culture and winemaking", socialTip: "Share a team toast photo, wine pairing tips, or after-work celebration content" },

  { date: "06-01", name: "World Milk Day", description: "Recognizing the importance of milk and dairy", socialTip: "Create breakfast-themed content or share fun dairy facts with your audience" },
  { date: "06-05", name: "World Environment Day", description: "Encouraging worldwide awareness for the environment", socialTip: "Launch an eco challenge, share green tips, or showcase your environmental impact" },
  { date: "06-08", name: "World Oceans Day", description: "Celebrating and preserving the world's oceans", socialTip: "Share ocean facts, beach cleanup stories, or blue-themed visual content" },
  { date: "06-16", name: "Father's Day", description: "Honoring fathers and fatherhood", socialTip: "Feature dad-themed content, gift ideas, or heartfelt employee stories" },
  { date: "06-21", name: "International Yoga Day", description: "Promoting physical and mental wellness through yoga", socialTip: "Share wellness tips, office yoga poses, or mindfulness content" },
  { date: "06-30", name: "Social Media Day", description: "Celebrating the impact of social media on communication", socialTip: "Share your social media journey, thank your followers, or reveal engagement stats" },

  { date: "07-01", name: "International Joke Day", description: "A day dedicated to humor and laughter", socialTip: "Post industry-related jokes, funny team moments, or a humorous behind-the-scenes" },
  { date: "07-04", name: "Independence Day (US)", description: "Celebrating American independence", socialTip: "Share patriotic content, summer deals, or festive team celebrations" },
  { date: "07-07", name: "World Chocolate Day", description: "Celebrating one of the world's favorite treats", socialTip: "Run a chocolate-themed giveaway or share sweet product pairings" },
  { date: "07-17", name: "World Emoji Day", description: "Celebrating the digital language of emojis", socialTip: "Create an emoji-only post challenge or run a caption contest using emojis" },
  { date: "07-30", name: "International Friendship Day", description: "Celebrating friendships around the world", socialTip: "Highlight brand partnerships, tag collaborators, or share friendship stories" },

  { date: "08-01", name: "World Wide Web Day", description: "Celebrating the invention of the World Wide Web", socialTip: "Share your first website, digital milestones, or tech evolution content" },
  { date: "08-08", name: "International Cat Day", description: "Celebrating feline companions worldwide", socialTip: "Share team pet photos, cat memes (tastefully), or partner with pet brands" },
  { date: "08-12", name: "International Youth Day", description: "Drawing attention to youth issues worldwide", socialTip: "Feature young team members, share internship stories, or post motivational content" },
  { date: "08-19", name: "World Photography Day", description: "Celebrating the art and craft of photography", socialTip: "Share your best brand photos, run a photo contest, or post camera tips" },
  { date: "08-26", name: "National Dog Day", description: "Celebrating all dogs and promoting adoption", socialTip: "Share office dog photos, pet-friendly workplace content, or partner with shelters" },

  { date: "09-05", name: "International Day of Charity", description: "Promoting charitable activities worldwide", socialTip: "Highlight your CSR efforts, charity partnerships, or donation campaigns" },
  { date: "09-08", name: "International Literacy Day", description: "Promoting literacy and education worldwide", socialTip: "Share reading recommendations, educational resources, or learning tips" },
  { date: "09-15", name: "International Day of Democracy", description: "Promoting and upholding democratic principles", socialTip: "Encourage civic engagement or share your company's democratic values" },
  { date: "09-21", name: "International Day of Peace", description: "Strengthening ideals of peace worldwide", socialTip: "Share peaceful imagery, team harmony content, or messages of unity" },
  { date: "09-27", name: "World Tourism Day", description: "Fostering awareness of tourism's role in society", socialTip: "Share travel tips, remote work locations, or team retreat highlights" },

  { date: "10-01", name: "World Vegetarian Day", description: "Promoting the benefits of plant-based eating and lifestyle", socialTip: "Share healthy recipes, plant-based meal ideas, or sustainability infographics" },
  { date: "10-05", name: "World Teachers' Day", description: "Celebrating educators and their contributions", socialTip: "Thank a mentor, share learning moments, or create educational content for your niche" },
  { date: "10-10", name: "World Mental Health Day", description: "Raising awareness of mental health issues globally", socialTip: "Share self-care tips, encourage open conversations, or highlight workplace wellness programs" },
  { date: "10-16", name: "World Food Day", description: "Promoting awareness and action for food security", socialTip: "Share team lunch photos, food-related content, or partner with food banks" },
  { date: "10-31", name: "Halloween", description: "A spooky celebration with costumes, trick-or-treating, and themed events", socialTip: "Post themed team photos, run a costume contest, or create spooky product content" },

  { date: "11-01", name: "World Vegan Day", description: "Celebrating veganism and plant-based lifestyles", socialTip: "Share vegan recipes, sustainable living tips, or eco-friendly product spotlights" },
  { date: "11-13", name: "World Kindness Day", description: "Encouraging acts of kindness worldwide", socialTip: "Start a kindness chain, highlight community support, or share heartwarming stories" },
  { date: "11-19", name: "International Men's Day", description: "Celebrating men's contributions and promoting positive masculinity", socialTip: "Feature male team members, share health tips, or post appreciation content" },
  { date: "11-28", name: "Thanksgiving (US)", description: "A day of gratitude, family gatherings, and feasting", socialTip: "Share a gratitude post, thank your customers, or highlight what your team is thankful for" },
  { date: "11-29", name: "Black Friday", description: "Biggest shopping event of the year with massive deals", socialTip: "Announce deals, create urgency with countdown posts, or share shopping tips" },

  { date: "12-01", name: "World AIDS Day", description: "Raising awareness about HIV/AIDS prevention", socialTip: "Share educational content, support resources, or show solidarity with red-themed posts" },
  { date: "12-05", name: "International Volunteer Day", description: "Recognizing the efforts of volunteers worldwide", socialTip: "Highlight your team's volunteer work, share impact stories, or encourage participation" },
  { date: "12-10", name: "Human Rights Day", description: "Commemorating the Universal Declaration of Human Rights", socialTip: "Share your company values, highlight diversity, or support human rights initiatives" },
  { date: "12-25", name: "Christmas Day", description: "A joyful celebration of family, giving, and festivity", socialTip: "Share holiday greetings, behind-the-scenes celebrations, or year-end appreciation posts" },
  { date: "12-31", name: "New Year's Eve", description: "The final day of the year, celebrating with parties and reflections", socialTip: "Post a year-in-review, share milestones, or countdown to the new year with your audience" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STORAGE_KEY = "holiday-calendar-custom";

function getSeasonIcon(month: number) {
  if (month >= 2 && month <= 4) return Flower2;
  if (month >= 5 && month <= 7) return Sun;
  if (month >= 8 && month <= 10) return Leaf;
  return Snowflake;
}

function getHolidayIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("love") || lower.includes("valentine") || lower.includes("hug") || lower.includes("kindness") || lower.includes("mother") || lower.includes("father")) return Heart;
  if (lower.includes("christmas") || lower.includes("gift") || lower.includes("thanksgiving")) return Gift;
  if (lower.includes("music")) return Music;
  if (lower.includes("new year") || lower.includes("halloween") || lower.includes("party")) return PartyPopper;
  if (lower.includes("day of") || lower.includes("world") || lower.includes("international")) return Star;
  return Sparkles;
}

function loadCustomHolidays(): Holiday[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveCustomHolidays(holidays: Holiday[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  } catch {}
}

type ViewMode = "calendar" | "list";

export default function HolidayCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [customHolidays, setCustomHolidays] = useState<Holiday[]>(loadCustomHolidays);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTip, setNewTip] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    saveCustomHolidays(customHolidays);
  }, [customHolidays]);

  const monthKey = String(currentMonth + 1).padStart(2, "0");

  const allHolidays = useMemo(() => {
    const builtIn = MOCK_HOLIDAYS
      .filter(h => h.date.startsWith(monthKey + "-"))
      .map(h => ({
        ...h,
        date: `${currentYear}-${h.date}`,
      }));

    const custom = customHolidays.filter(h => {
      const d = new Date(h.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return [...builtIn, ...custom].sort((a, b) => a.date.localeCompare(b.date));
  }, [currentMonth, currentYear, monthKey, customHolidays]);

  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return allHolidays;
    const q = searchQuery.toLowerCase();
    return allHolidays.filter(h =>
      h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
    );
  }, [allHolidays, searchQuery]);

  const holidaysByDay = useMemo(() => {
    const map: Record<number, Holiday[]> = {};
    allHolidays.forEach(h => {
      const day = new Date(h.date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(h);
    });
    return map;
  }, [allHolidays]);

  const upcomingCount = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const laterStr = `${sevenDaysLater.getFullYear()}-${String(sevenDaysLater.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysLater.getDate()).padStart(2, "0")}`;
    return allHolidays.filter(h => h.date >= todayStr && h.date <= laterStr).length;
  }, [allHolidays, today]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const todayDate = today.getDate();
  const SeasonIcon = getSeasonIcon(currentMonth);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, [today]);

  const openHoliday = useCallback((h: Holiday) => {
    setSelectedHoliday(h);
    setModalOpen(true);
  }, []);

  const addCustomHoliday = useCallback(() => {
    if (!newName.trim() || !newDate) {
      toast({ title: "Missing fields", description: "Please provide a name and date.", variant: "destructive" });
      return;
    }
    const holiday: Holiday = {
      date: newDate,
      name: newName.trim(),
      description: newDesc.trim() || "Custom holiday",
      socialTip: newTip.trim() || "Create content around this special day",
      isCustom: true,
    };
    setCustomHolidays(prev => [...prev, holiday]);
    setNewName(""); setNewDate(""); setNewDesc(""); setNewTip("");
    setShowAddForm(false);
    toast({ title: "Holiday added", description: `${holiday.name} has been added to your calendar.` });
  }, [newName, newDate, newDesc, newTip, toast]);

  const removeCustomHoliday = useCallback((h: Holiday) => {
    setCustomHolidays(prev => prev.filter(x => !(x.date === h.date && x.name === h.name)));
    setModalOpen(false);
    toast({ title: "Holiday removed", description: `${h.name} has been removed.` });
  }, [toast]);

  const exportHolidays = useCallback(() => {
    const data = JSON.stringify(allHolidays, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holidays-${MONTH_NAMES[currentMonth].toLowerCase()}-${currentYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${allHolidays.length} holidays exported as JSON.` });
  }, [allHolidays, currentMonth, currentYear, toast]);

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  return (
    <ToolPageLayout
      title="Social Media Holiday Calendar"
      description="Plan your social media content around holidays and special days. View all holidays by month with content tips and export your planning data."
      toolPath="/holiday-calendar"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Browse holidays for the current month in Calendar or List view.</li>
          <li>Click any holiday to see details and social media content tips.</li>
          <li>Use the arrow buttons to navigate between months.</li>
          <li>Add your own custom holidays using the Add Holiday form.</li>
          <li>Search holidays by name or description using the search bar.</li>
          <li>Export the month's holidays as a JSON file for your planning needs.</li>
        </ol>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="icon"
              variant="outline"
              onClick={goToPrevMonth}
              aria-label="Previous month"
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <SeasonIcon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground" data-testid="text-current-month">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={goToNextMonth}
              aria-label="Next month"
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {!isCurrentMonth && (
              <Button
                variant="ghost"
                onClick={goToToday}
                className="text-xs"
                data-testid="button-go-today"
              >
                Today
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {upcomingCount > 0 && isCurrentMonth && (
              <Badge variant="secondary" className="text-xs" data-testid="badge-upcoming">
                <Bell className="w-3 h-3 mr-1" />
                {upcomingCount} upcoming
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs" data-testid="badge-total-holidays">
              {allHolidays.length} holiday{allHolidays.length !== 1 ? "s" : ""}
            </Badge>
            <div className="flex border border-border rounded-md overflow-visible">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                onClick={() => setViewMode("calendar")}
                className="rounded-r-none text-xs toggle-elevate"
                aria-pressed={viewMode === "calendar"}
                data-testid="button-view-calendar"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="rounded-l-none text-xs toggle-elevate"
                aria-pressed={viewMode === "list"}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search holidays"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              data-testid="button-toggle-add-form"
            >
              {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {showAddForm ? "Cancel" : "Add Holiday"}
            </Button>
            <Button
              variant="outline"
              onClick={exportHolidays}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="p-4 space-y-3" data-testid="add-holiday-form">
            <p className="text-sm font-medium text-foreground">Add Custom Holiday</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Holiday name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                aria-label="Holiday name"
                data-testid="input-new-name"
              />
              <Input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                aria-label="Holiday date"
                data-testid="input-new-date"
              />
            </div>
            <Input
              placeholder="Brief description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              aria-label="Holiday description"
              data-testid="input-new-desc"
            />
            <Input
              placeholder="Social media tip (optional)"
              value={newTip}
              onChange={e => setNewTip(e.target.value)}
              aria-label="Social media tip"
              data-testid="input-new-tip"
            />
            <Button onClick={addCustomHoliday} data-testid="button-add-holiday">
              <Plus className="w-4 h-4 mr-1" />
              Add to Calendar
            </Button>
          </Card>
        )}

        {viewMode === "calendar" ? (
          <div data-testid="calendar-view" role="grid" aria-label={`Calendar for ${MONTH_NAMES[currentMonth]} ${currentYear}`}>
            <div className="grid grid-cols-7 gap-1 mb-1" role="row">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2" role="columnheader">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
                const dayHolidays = holidaysByDay[day] || [];
                const isToday = isCurrentMonth && day === todayDate;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-md border p-1 flex flex-col transition-colors ${
                      isToday
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : dayHolidays.length > 0
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30"
                          : "border-border"
                    } ${dayHolidays.length > 0 ? "cursor-pointer hover-elevate" : ""}`}
                    role="gridcell"
                    tabIndex={dayHolidays.length > 0 ? 0 : -1}
                    aria-label={`${MONTH_NAMES[currentMonth]} ${day}${dayHolidays.length > 0 ? `, ${dayHolidays.length} holiday${dayHolidays.length > 1 ? "s" : ""}: ${dayHolidays.map(h => h.name).join(", ")}` : ""}`}
                    onClick={() => dayHolidays.length > 0 && openHoliday(dayHolidays[0])}
                    onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && dayHolidays.length > 0) { e.preventDefault(); openHoliday(dayHolidays[0]); } }}
                    data-testid={`cell-day-${day}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
                      {day}
                    </span>
                    <div className="flex-1 overflow-hidden mt-0.5">
                      {dayHolidays.slice(0, 2).map((h, i) => (
                        <p key={i} className="text-[10px] leading-tight text-blue-600 dark:text-blue-400 truncate">
                          {h.name}
                        </p>
                      ))}
                      {dayHolidays.length > 2 && (
                        <p className="text-[9px] text-muted-foreground">+{dayHolidays.length - 2} more</p>
                      )}
                    </div>
                    {dayHolidays.length > 0 && (
                      <div className="flex gap-0.5 mt-auto">
                        {dayHolidays.slice(0, 3).map((_, i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2" data-testid="list-view" role="list" aria-label="Holiday list">
            {filteredHolidays.length === 0 && (
              <Card className="p-8 text-center">
                <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground" data-testid="text-no-holidays">
                  {searchQuery ? "No holidays match your search." : "No holidays this month."}
                </p>
              </Card>
            )}
            {filteredHolidays.map((h, idx) => {
              const HolidayIcon = getHolidayIcon(h.name);
              const dateObj = new Date(h.date);
              const dayNum = dateObj.getDate();
              const dayName = DAY_NAMES[dateObj.getDay()];
              return (
                <Card
                  key={`${h.date}-${h.name}-${idx}`}
                  className="p-4 cursor-pointer hover-elevate transition-all"
                  role="listitem"
                  tabIndex={0}
                  onClick={() => openHoliday(h)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openHoliday(h); } }}
                  aria-label={`${h.name} on ${MONTH_NAMES[currentMonth]} ${dayNum}`}
                  data-testid={`list-holiday-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center min-w-[48px] py-1">
                      <span className="text-[10px] text-muted-foreground uppercase">{dayName}</span>
                      <span className="text-xl font-bold text-foreground">{dayNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <HolidayIcon className="w-4 h-4 text-blue-500 shrink-0" />
                        <h4 className="font-medium text-foreground text-sm">{h.name}</h4>
                        {h.isCustom && <Badge variant="secondary" className="text-[10px]">Custom</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" aria-describedby="holiday-modal-desc">
          {selectedHoliday && (() => {
            const HolidayIcon = getHolidayIcon(selectedHoliday.name);
            const dateObj = new Date(selectedHoliday.date);
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <HolidayIcon className="w-5 h-5 text-blue-500" />
                    <DialogTitle data-testid="modal-holiday-name">{selectedHoliday.name}</DialogTitle>
                  </div>
                  <DialogDescription id="holiday-modal-desc" data-testid="modal-holiday-date">
                    {MONTH_NAMES[dateObj.getMonth()]} {dateObj.getDate()}, {dateObj.getFullYear()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">About</p>
                    <p className="text-sm text-muted-foreground" data-testid="modal-holiday-desc">{selectedHoliday.description}</p>
                  </div>
                  <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Social Media Tip</p>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400" data-testid="modal-holiday-tip">{selectedHoliday.socialTip}</p>
                  </div>
                  {selectedHoliday.isCustom && (
                    <Button
                      variant="outline"
                      className="w-full text-red-500"
                      onClick={() => removeCustomHoliday(selectedHoliday)}
                      data-testid="button-remove-holiday"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Custom Holiday
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </ToolPageLayout>
  );
}