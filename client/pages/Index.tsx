import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, Sparkles, TrendingUp, Zap, Brain, LineChart } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
}

const featuredPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI: How Machine Learning is Transforming Business",
    excerpt:
      "Discover how artificial intelligence is revolutionizing industries and creating new opportunities for growth and innovation.",
    category: "AI",
    image: "https://images.unsplash.com/photo-1677442d019cecf8b13f1d4d04a5fc033?w=800&h=400&fit=crop",
    date: "Today",
    author: "Sarah Chen",
    readTime: "8 min read",
  },
  {
    id: "2",
    title: "SEO Trends 2024: What You Need to Know",
    excerpt:
      "Stay ahead of the competition with the latest SEO strategies and best practices for improving your online visibility.",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-adf4e565db57?w=800&h=400&fit=crop",
    date: "Yesterday",
    author: "Marcus Johnson",
    readTime: "6 min read",
  },
  {
    id: "3",
    title: "Startup Success: Building Products That Scale",
    excerpt:
      "Learn the secrets from successful entrepreneurs about building scalable products and sustainable business models.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    date: "2 days ago",
    author: "Emma Rodriguez",
    readTime: "10 min read",
  },
];

const categoryCards = [
  {
    icon: Brain,
    title: "Artificial Intelligence",
    description: "Latest AI breakthroughs and machine learning insights",
    color: "from-purple-500/10 to-transparent",
    count: "156 articles",
  },
  {
    icon: Zap,
    title: "Technology",
    description: "Cutting-edge tech news and software development trends",
    color: "from-blue-500/10 to-transparent",
    count: "243 articles",
  },
  {
    icon: TrendingUp,
    title: "Business",
    description: "Entrepreneurship, startups, and corporate insights",
    color: "from-emerald-500/10 to-transparent",
    count: "189 articles",
  },
  {
    icon: LineChart,
    title: "Marketing & SEO",
    description: "Digital marketing strategies and search optimization",
    color: "from-amber-500/10 to-transparent",
    count: "201 articles",
  },
];

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mb-6">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">
                  Daily insights for digital leaders
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-6">
                seommerce.shop
              </h1>

              <p className="text-xl sm:text-2xl text-foreground/70 mb-8 leading-relaxed">
                Your daily source for the latest news and insights on{" "}
                <span className="font-semibold text-primary">technology</span>,{" "}
                <span className="font-semibold text-secondary">AI</span>,{" "}
                <span className="font-semibold text-primary">business</span>, and{" "}
                <span className="font-semibold text-secondary">digital marketing</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 flex items-center justify-center gap-2 group">
                  Subscribe Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all">
                  Latest Articles
                </button>
              </div>

              <p className="text-sm text-foreground/50">
                Join 10,000+ professionals who stay informed
              </p>
            </div>
          </div>
        </section>

        {/* Featured Articles Section */}
        <section className="py-20 sm:py-32 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Featured Articles
              </h2>
              <p className="text-lg text-foreground/60">
                Discover our most popular stories this week
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className={`group rounded-xl overflow-hidden border border-border bg-card hover:border-secondary transition-all hover:shadow-xl hover:shadow-secondary/10 ${
                    index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-muted ${
                      index === 0 ? "h-96" : "h-48"
                    }`}
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-foreground/60 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-foreground/50">
                      <div className="flex items-center gap-2">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all inline-flex items-center gap-2 group">
                View All Articles
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 sm:py-32 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Explore Topics
              </h2>
              <p className="text-lg text-foreground/60">
                Dive deep into our most popular categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryCards.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} rounded-xl blur-xl transition-all group-hover:blur-2xl`} />
                    <div className="relative border border-border bg-card rounded-xl p-8 hover:border-secondary transition-all hover:shadow-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-foreground/60 mb-4">{cat.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-secondary font-semibold">
                          {cat.count}
                        </span>
                        <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 sm:py-32 border-b border-border bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Stay Updated Daily
              </h2>
              <p className="text-lg text-foreground/60 mb-8">
                Get the latest articles delivered straight to your inbox. No spam, just quality content.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-6 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-secondary/20 transition-all hover:scale-105 whitespace-nowrap">
                  Subscribe
                </button>
              </div>

              <p className="text-xs text-foreground/50 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Recent Articles Preview */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Latest from the Blog
              </h2>
              <p className="text-lg text-foreground/60">
                Fresh content published daily
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <article
                  key={i}
                  className="group rounded-lg border border-border bg-card hover:border-secondary transition-all hover:shadow-lg"
                >
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-secondary/30" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-3">
                      {["Technology", "AI", "Business", "Marketing", "Startup", "SEO"][i % 6]}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      Amazing Article Title About {["Tech", "AI", "Business", "SEO", "Marketing", "Innovation"][i % 6]}
                    </h3>
                    <p className="text-sm text-foreground/60 line-clamp-2 mb-4">
                      Discover insights and best practices for your digital success.
                    </p>
                    <div className="flex items-center justify-between text-xs text-foreground/50">
                      <span>5 min read</span>
                      <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
