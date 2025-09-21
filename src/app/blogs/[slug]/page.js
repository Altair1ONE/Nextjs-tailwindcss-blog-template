import BlogDetails from "@/src/components/Blog/BlogDetails";
import RenderMdx from "@/src/components/Blog/RenderMdx";
import Tag from "@/src/components/Elements/Tag";
import siteMetadata from "@/src/utils/siteMetaData";
import { blogs } from '@/.velite/generated'
import { slug as slugify } from "github-slugger";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const blog = blogs.find((blog) => blog.slug === slug);
  if (!blog) {
    return;
  }

  const publishedAt = new Date(blog.publishedAt).toISOString();
  const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();

  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.src === "string"
        ? [siteMetadata.siteUrl + blog.image.src]
        : blog.image;
  }
  const ogImages = imageList.map((img) => {
    return { url: img.includes("http") ? img : siteMetadata.siteUrl + img };
  });

  const authors = blog?.author ? [blog.author] : siteMetadata.author;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: siteMetadata.siteUrl + blog.url,
      siteName: siteMetadata.title,
      locale: "en_US",
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: ogImages,
    },
  };
}

function TableOfContentsItem({ item, level = "two" }) {
  return (
    <li className="py-1">
      <a
        href={item.url}
        data-level={level}
        className="data-[level=two]:pl-0 data-[level=two]:pt-2
                  data-[level=two]:border-t border-solid border-dark/40
                  data-[level=three]:pl-4
                  sm:data-[level=three]:pl-6
                  flex items-center justify-start"
      >
        {level === "three" && (
          <span className="flex w-1 h-1 rounded-full bg-dark mr-2">&nbsp;</span>
        )}
        <span className="hover:underline">{item.title}</span>
      </a>
      {item.items.length > 0 && (
        <ul className="mt-1">
          {item.items.map((subItem) => (
            <TableOfContentsItem
              key={subItem.url}
              item={subItem}
              level="three"
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function BlogPage({ params }) {
  const { slug } = await params
  const blog = blogs.find((blog) => {
    return blog.slug === slug
  });

  if (!blog) {
    notFound()
  }

  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.src === "string"
        ? [siteMetadata.siteUrl + blog.image.src]
        : blog.image;
  }

  // ✅ NewsArticle JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": blog.title,
    "description": blog.description,
    "image": imageList,
    "datePublished": new Date(blog.publishedAt).toISOString(),
    "dateModified": new Date(blog.updatedAt || blog.publishedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": blog?.author || siteMetadata.author,
      "url": siteMetadata.twitter,
    }]
  }

    // ✅ FAQ JSON-LD (custom per cornerstone article)
  let faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is this article about?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": blog.description
        }
      },
      {
        "@type": "Question",
        "name": "Who is the author of this article?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": blog?.author || siteMetadata.author
        }
      },
      {
        "@type": "Question",
        "name": "When was this article published?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": new Date(blog.publishedAt).toDateString()
        }
      }
    ]
  }

  // ✅ Cornerstone-specific FAQs
  if (slug === "revenge-saving-emergency-fund-2025") {
    faqJsonLd.mainEntity = [
      {
        "@type": "Question",
        "name": "What is revenge saving?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Revenge saving happens when people aggressively save money after periods of heavy spending or financial regret, often driven by emotional rather than rational reasons."
        }
      },
      {
        "@type": "Question",
        "name": "Why is revenge saving a problem?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It creates an unhealthy cycle of overspending followed by extreme saving, which can harm both your financial stability and mental health."
        }
      },
      {
        "@type": "Question",
        "name": "How can I avoid revenge saving?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best way is to build balanced habits—set realistic budgets, automate savings, and allow for guilt-free spending within limits."
        }
      }
    ]
  }

  if (slug === "digital-wellness-micro-habits-2025") {
    faqJsonLd.mainEntity = [
      {
        "@type": "Question",
        "name": "What is digital wellness?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Digital wellness is the practice of using technology in a way that supports your mental, physical, and emotional health."
        }
      },
      {
        "@type": "Question",
        "name": "Why is digital wellness important?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Without boundaries, technology can lead to stress, poor sleep, and reduced focus. Digital wellness helps restore balance."
        }
      },
      {
        "@type": "Question",
        "name": "What are simple ways to improve digital wellness?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can set screen time limits, use do-not-disturb during rest hours, and schedule offline activities to disconnect from devices."
        }
      }
    ]
  }

  if (slug === "practical-ai-for-non-tech-founders-2025") {
    faqJsonLd.mainEntity = [
      {
        "@type": "Question",
        "name": "Can non-technical founders use AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, many AI tools are designed with no-code interfaces, making it possible for non-technical founders to leverage AI for their startups."
        }
      },
      {
        "@type": "Question",
        "name": "What are the benefits of AI for startups?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI can automate tasks, improve customer support, generate insights from data, and help scale businesses faster."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need coding skills to use AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not always. Many platforms offer user-friendly dashboards and integrations that let founders apply AI without writing code."
        }
      }
    ]
  }


  return (
    <>
      {/* ✅ SEO JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ✅ Blog Content */}
      <article>
        <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Tag
              name={blog.tags[0]}
              link={`/categories/${slugify(blog.tags[0])}`}
              className="px-6 text-sm py-2"
            />
            <h1
              className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
            >
              {blog.title}
            </h1>
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
          <Image
            src={blog.image.src}
            placeholder="blur"
            blurDataURL={blog.image.blurDataURL}
            alt={blog.title}
            width={blog.image.width}
            height={blog.image.height}
            className="aspect-square w-full h-full object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>

        <BlogDetails blog={blog} slug={params.slug} />

        <div className="grid grid-cols-12  gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
          <div className="col-span-12  lg:col-span-4">
            <details
              className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
              open
            >
              <summary className="text-lg font-semibold capitalize cursor-pointer">
                Table Of Content
              </summary>
              <ul className="mt-4 font-in text-base">
                {blog.toc.map((item) => (
                  <TableOfContentsItem key={item.url} item={item} />
                ))}
              </ul>
            </details>
          </div>
          <RenderMdx blog={blog} />
        </div>
      </article>
    </>
  );
}
