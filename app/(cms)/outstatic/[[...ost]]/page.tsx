import "outstatic/outstatic.css";
import "../outstatic-light.css";
import { Outstatic } from "outstatic";
import { OstClient } from "outstatic/client";
import { OutstaticLightTheme } from "../OutstaticLightTheme";

function OutstaticConfigurationNotice() {
  const hasGithubAuth =
    Boolean(process.env.OST_GITHUB_ID) && Boolean(process.env.OST_GITHUB_SECRET);
  const hasProAuth = Boolean(process.env.OUTSTATIC_API_KEY);

  if (hasGithubAuth || hasProAuth) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-2xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
    >
      <strong>Outstatic saving is not configured.</strong>{" "}
      Add the GitHub OAuth variables (or <code>OUTSTATIC_API_KEY</code>) and
      restart the app before creating or saving a blog post.
    </div>
  );
}

export default async function OutstaticPage({
  params,
}: {
  params: Promise<{ ost?: string[] }>;
}) {
  const resolvedParams = await params;
  const ostData = await Outstatic();
  return (
    <>
      <OutstaticLightTheme />
      <OutstaticConfigurationNotice />
      <OstClient ostData={ostData} params={{ ost: resolvedParams.ost || [] }} />
    </>
  );
}
