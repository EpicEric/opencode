export * as Host from "./host.js"

import path from "node:path"
import { importModule, resolveModule } from "@opencode/util/runtime-import"

export interface Target {
  readonly directory: string
  readonly name?: string
}

export interface Entrypoints {
  readonly server?: string
  readonly tui?: string
  readonly rpc?: string
}

export function resolve(target: Target): Entrypoints {
  const entry = (subpaths: readonly string[]) => {
    for (const subpath of subpaths) {
      const specifier = target.name
        ? [target.name, subpath].filter(Boolean).join("/")
        : path.resolve(target.directory, subpath || "index")
      try {
        return resolveModule(specifier, target.directory)
      } catch {
        // An unresolvable candidate means the conventional entrypoint is
        // absent. Resolution errors do not carry a stable error code across
        // Bun builds, so tolerate every failure instead of inspecting
        // `error.code` and fall through to the next candidate.
      }
    }
    return undefined
  }
  return { server: entry(["server", ""]), tui: entry(["tui"]), rpc: entry(["rpc"]) }
}

export function load(entrypoint: string): Promise<unknown> {
  return importModule(entrypoint)
}
