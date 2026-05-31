import React from "react";
import { siteConfig } from "@/configs/site";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const SiteFooter = () => {
  const socialLinks = siteConfig.socialLinks?.filter(item => item.href) || [];
  const footerItems = siteConfig.footerItems?.filter(item => item.href) || [];

  return (
    <footer aria-label="Footer" className="w-full">
      <div className="container grid w-full max-w-6xl gap-7 py-10">
        <div className="flex flex-wrap items-center gap-2">
          {socialLinks.length > 0 && socialLinks.map(
            (item, i) =>
              item.href && (
                <Link key={i} href={item.href} target="_blank" rel="noreferrer">
                  <div
                    className={buttonVariants({
                      size: "sm",
                      variant: "ghost",
                      className:
                        "rounded-none hover:bg-transparent",
                    })}
                  >
                    {item.icon && <item.icon className="h-6 w-6" />}
                    <span className="sr-only">{item.title}</span>
                  </div>
                </Link>
              ),
          )}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {footerItems.length > 0 && footerItems.map(
            (item, i) =>
              item.href && (
                <li
                  key={i}
                  className="text-xs text-foreground/60 hover:underline sm:text-sm"
                >
                  <Link href={item.href}>{item.title}</Link>
                </li>
              ),
          )}
        </ul>
        <p className="text-xs text-foreground/60 sm:text-sm">
          @ 2023-{new Date().getFullYear()} {siteConfig.author}.
        </p>
      </div>
      <div className="container flex h-24 items-center gap-2 px-8">
        <Icons.play className="hidden h-6 w-6 md:block" />
        <p className="text-center text-xs leading-loose sm:text-sm md:text-left">
          Built by{" "}
          <a
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {siteConfig.author}
          </a>
          . The source code is available on{" "}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
