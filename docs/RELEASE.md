# Publish to GitHub Pages and npm

One GitHub repository contains the CSS package, playground, examples and HTML/Vite Storybook. Pages publishes the site and Storybook together; npm publishes the reusable CSS and optional tab helper.

## Configured setup

Core versions were checked against npm on 11 October 2026: Vite 8.3.4, Storybook 10.6.1 and Playwright 1.64.0 match the registry's latest tags. The lint environment helper was updated to globals 17.13.0. CI uses Node 24 and current official GitHub Actions releases; npm publishing pins npm 11.6.2, which supports trusted publishing and remains compatible with the first version tags. The package-consumer check also accepts npm 12’s object-shaped pack metadata. Dependabot checks npm and GitHub Actions weekly, grouping Storybook updates together.

The approved destination is the public GitHub repository `cmwen/min-design-system` and the public npm package `@cmwen/min-design-system`. Package metadata is configured for these names. Remote publication status is recorded in VALIDATION.md.

## 1. Configure the destination

This project uses `cmwen/min-design-system` on GitHub and `@cmwen/min-design-system` on npm. For a fork, choose your own GitHub repository and npm name. An unscoped name is public; a scoped public name belongs to your npm account or organization. A missing registry entry does not guarantee that npm will allow the name.

```sh
npm run release:configure -- --repo cmwen/min-design-system --package @cmwen/min-design-system
# A scoped name is also supported:
# npm run release:configure -- --repo OWNER/REPOSITORY --package @YOUR_NPM_ACCOUNT/forest-and-fern
npm run release:check
```

This sets repository, homepage, bugs, npm registry/public access and `private: false`, and synchronizes the lockfile's package name. The identity checker rejects mismatched repository/tag values and runtime dependencies. It does not publish anything. For a dedicated custom domain served at its root, update `homepage` and set the repository variable `FF_BASE` to `/`. Project sites inheriting the account domain retain their repository subpath.

Create or use the chosen repository and commit this workspace there, including `package-lock.json`, `.github/`, source, stories, tests and docs. Ignore node_modules, dist, tarballs and test reports. In a normal checkout, push the changes to the default branch. This workspace's read-only placeholder `.git` cannot serve as that checkout; use a real checkout or upload the source through GitHub.

## 2. Enable GitHub Pages

In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. On a default-branch push, `deploy.yml` runs lint, unit tests, site and Storybook builds, package-consumer validation, browser tests, Storybook interactions and a benchmark before deployment. Pull requests receive verification without deployment.

This site inherits the account domain and is served at `https://cmwen.dev/min-design-system/` (Storybook at `https://cmwen.dev/min-design-system/storybook/`). Project sites derive `FF_BASE` as `/REPOSITORY/`; `OWNER.github.io` repositories use `/`. Set repository variable `FF_BASE` to override the base for a custom domain. The playground is at the Pages root; examples and documentation retain their routes; Storybook is under `storybook/`. The deployment job reports the resulting URL.

## 3. Validate the installable package

```sh
npm ci
npm run check
npm run build-storybook
npm run test:package
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:storybook
npm run benchmark
npm pack --dry-run
```

The package includes modular CSS, the stable standalone CSS artifact, the optional tabs module, license and installation/workshop/release documentation. Demo fonts, branding assets, playground code and Storybook dependencies stay outside the runtime package. The package-consumer test installs a tarball into an independent Vite app and checks all public entry points, including scoped names.

## 4. Publish the first version

Sign in to your npm account locally with `npm login`. Enable the authentication method npm requires for public publishing. Run the checks above and review the tarball contents, then publish from the configured default-branch checkout:

```sh
npm run release:check
npm publish --access public
```

This is a real public publication of the version in `package.json`; npm runs the production build through `prepack`. Your login/2FA stays in your terminal or npm browser flow. Do not paste a token or OTP into a source file or chat. Once the package exists, configure its trusted publisher for future releases.

## 5. Enable trusted publishing

In the npm package's **Settings → Trusted publishing**, choose GitHub Actions and provide:

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| Owner             | `cmwen`                              |
| Repository        | `min-design-system`                  |
| Workflow filename | `publish.yml`                        |
| Environment       | `npm`                                |
| Allowed action    | Direct publishing with `npm publish` |

Create a GitHub environment named `npm` matching that configuration. npm's trusted publishing uses GitHub OIDC rather than a stored write token. Public packages published from public repositories receive automatic provenance. A new trusted publisher must complete its first successful publish within two days; configure it when the next release is ready. See [npm's trusted-publishing documentation](https://docs.npmjs.com/trusted-publishers/).

## 6. Publish later versions

```sh
npm version patch
# Push the version commit and tag from your normal checkout:
git push origin HEAD --follow-tags
```

Create and publish a GitHub Release using that version's tag (`v0.2.0`, for example) and targeting the default branch. `publish.yml` checks out the exact tag, verifies that the commit belongs to the default branch and the tag matches `package.json`, reruns the complete quality checks, then publishes to npm using OIDC. Stable versions use `latest`; prereleases use `next`. The publish step skips lifecycle scripts because the build and tests have already finished. It does not run on ordinary pushes or pull requests. To retry an existing tag after repairing the workflow, select **Actions → Publish npm package → Run workflow** on the default branch and supply the existing tag. This uses the current workflow while preserving the tagged package source. Check that the version is absent from npm before retrying; never move a published version tag.

After the initial manual version is published, do not trigger an automated publication of the same version. npm version numbers cannot be reused. If a workflow fails after publication, check the registry before retrying.

## Install in another app

After a successful release, replace the name below with your configured npm name:

```sh
npm install @cmwen/min-design-system
```

```js
import '@cmwen/min-design-system';
// Alternatively: import '@cmwen/min-design-system/forest-and-fern.css';
import { initTabs } from '@cmwen/min-design-system/tabs'; // optional
```

Apply `.ff-theme` to the app boundary and use native HTML with the documented classes. See [INSTALL.md](INSTALL.md) for recipes and theme overrides.
