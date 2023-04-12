import * as core from "@actions/core"
import * as github from "@actions/github"
import * as tc from "@actions/tool-cache"
import { exec } from "@actions/exec"

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
    ...args: any
) => Promise<infer R>
    ? R
    : any

async function main() {
    let repo = { owner: "casey", repo: "just" }

    try {
        let ghToken = process.env.GITHUB_TOKEN || core.getInput("github-token")
        let version = core.getInput("just-version") || "latest"

        let octokit = github.getOctokit(ghToken)

        let release: AsyncReturnType<typeof octokit.rest.repos.getRelease>

        if (version === "latest") {
            release = await octokit.rest.repos.getLatestRelease(repo)
        } else {
            release = await octokit.rest.repos.getReleaseByTag({ ...repo, tag: version })
        }

        let assets = await octokit.rest.repos.listReleaseAssets({
            owner: "casey",
            repo: "just",
            release_id: release.data.id,
        })

        let justCachedDir = tc.find("just", release.data.tag_name, process.arch)
        if (justCachedDir) {
            core.addPath(justCachedDir)
            await exec("just --version")
            core.info(`Successfully setup just ${release.data.tag_name}`)
            return
        }

        let platformPair = getPlatformPair()

        let asset = assets.data.find((a) => a.name.includes(platformPair))
        if (!asset) {
            throw new Error(`can't find release of just version ${version} for ${platformPair}`)
        }

        core.info(`Downloading ${asset.browser_download_url}`)
        let justDownloadPath = await tc.downloadTool(asset.browser_download_url)
        let justExtractedPath = await tc.extractTar(justDownloadPath)

        let justCachedPath = await tc.cacheDir(justExtractedPath, "just", release.data.tag_name)

        core.addPath(justCachedPath)

        await exec("just --version")

        core.info(`Successfully setup just ${release.data.tag_name}`)
    } catch (err) {
        if (err instanceof Error) {
            core.setFailed(err.message)
        }
    }
}

function getPlatformPair() {
    let pair = ""

    let arch = process.arch
    let platform = process.platform

    switch (arch) {
        case "arm":
        case "arm64":
            pair = "aarch64"
            break
        case "x64":
            pair = "x86_64"
            break
    }

    switch (platform) {
        case "darwin":
            pair += "-apple-darwin"
            break
        case "linux":
            pair += "-unknown-linux-musl"
            break
    }

    return pair
}

main()
