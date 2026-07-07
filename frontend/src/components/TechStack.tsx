import Reveal from "@/components/Reveal";
import { GitHubIcon } from "@/components/icons";
import {
  ClaudeIcon,
  CryptomusIcon,
  GeminiIcon,
  GitBookIcon,
  GoogleIcon,
  RedisIcon,
  StripeIcon,
} from "@/components/techIcons";

const TECHS = [
  { key: "github", label: "GitHub", Icon: GitHubIcon },
  { key: "gitbook", label: "GitBook", Icon: GitBookIcon },
  { key: "gemini", label: "Gemini", Icon: GeminiIcon },
  { key: "google", label: "Google", Icon: GoogleIcon },
  { key: "claude", label: "Anthropic Claude", Icon: ClaudeIcon },
  { key: "redis", label: "Redis", Icon: RedisIcon },
  { key: "stripe", label: "Stripe", Icon: StripeIcon },
  { key: "cryptomus", label: "Cryptomus", Icon: CryptomusIcon },
] as const;

const LOOP_TECHS = [...TECHS, ...TECHS];

export default function TechStack() {
  return (
    <section id="tech-stack" className="relative overflow-hidden">
      <Reveal>
        <div
          className="relative overflow-hidden py-6"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="animate-[marquee_38s_linear_infinite] flex w-max items-center gap-10">
            {LOOP_TECHS.map((tech, i) => {
              const Icon = tech.Icon;
              return (
                <div
                  key={`${tech.key}-${i}`}
                  className="flex shrink-0 items-center gap-2 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
                >
                  <Icon className="h-6 w-6 text-accent" />
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">
                    {tech.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
