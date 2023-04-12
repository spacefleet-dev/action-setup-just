# action-setup-just

This GitHub Action will install a binary of [just](https://github.com/casey/just) in a github actions workflow.

## Usage

### Examples

Add the following to your workflow to install the latest version of just.

```yaml
- uses: spacefleet-dev/action-setup-just@v1
```

To install specific version of `just` specify the version in the `just-version` input.

```yaml
- uses: spacefleet-dev/action-setup-just@v1
  with:
    just-version: '1.13.0'
```

To prevent rate-limiting, the default Github token is automatically used when downloading from GitHub.
This can be overriden using the environment variable `GITHUB_TOKEN` or by passing a valid token to the `github-token` input.

```yaml
- uses: spacefleet-dev/action-setup-just@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

or

```yaml
- uses: spacefleet-dev/action-setup-just@v1
  with:
    github-token: ${{ secrets.MY_GITHUB_TOKEN }}
```

### Inputs

| Name           | Required | Description                                                         | Type   | Default               |
| -------------- | -------- | ------------------------------------------------------------------- | ------ | --------------------- |
| `just-version` | no       | Version of just to install                                          | string | latest                |
| `github-token` | no       | Github token to use to authenticate downloads/prevent rate limiting | string | `${{ github.token }}` |
