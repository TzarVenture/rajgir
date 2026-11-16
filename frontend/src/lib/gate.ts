/**
 * Launch switch for the Coming Soon gate.
 *
 * The site is gated (public visitors only see Coming Soon) unless the
 * environment explicitly sets COMING_SOON=false. Failing closed means a
 * missing/mistyped variable can never expose the unfinished real site.
 *
 * Launch day: set COMING_SOON=false in the env file and restart.
 */
export function isGateActive(): boolean {
  return process.env.COMING_SOON?.trim().toLowerCase() !== "false";
}
