# Required production branch protection

`main` is the production branch for Light Tower Table Top Guild and must not accept unverified direct pushes.

Required GitHub repository settings:

- Protect `main` with a branch ruleset or branch protection rule.
- Require pull requests before merging.
- Require the **Lighthouse quality gate** workflow to pass.
- Require branches to be up to date before merge when GitHub supports it for the selected rule type.
- Block force pushes and branch deletion.
- Do not allow bypass for routine content or styling changes.

The repository's CI already validates source structure, organizer security, JavaScript syntax, the generated shared shell, production CSS, release boundaries, and Lighthouse performance/accessibility/best-practices/SEO targets. Protection makes those gates mandatory rather than advisory.

The ChatGPT GitHub connection used for this project does not have repository administration permissions, so this setting must be enabled by a repository administrator in GitHub.
