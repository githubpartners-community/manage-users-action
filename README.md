# Manage Users Action

This GitHub action adds and removes multiple users from multiple teams in an organization.

If a user is already part of the team, running it again will not change the user's role.

A user will be removed from the organization regardless of whether the user accepted the invitation. A pending invitation will be cancelled.

---

## Inputs

| NAME           | DESCRIPTION                                                | TYPE     | REQUIRED | DEFAULT |
| -------------- | ---------------------------------------------------------- | -------- | -------- | ------- |
| `token`        | A GitHub token with access to the target organization      | `string` | `true`   | `N/A`   |
| `users`        | Comma-separated GitHub slug of users to provide access to. | `string` | `true`   | `N/A`   |
| `teams`        | Comma-separated slugs of the teams to add users to.        | `string` | `true`   | `N/A`   |
| `organization` | GitHub organization name                                   | `string` | `true`   | `N/A`   |
| `action`       | The action to perform. Add or Remove.                      | `string` | `true`   | `N/A`   |

---

## Usage example

Add the following snippet to an existing workflow file:

```yml
- name: Run Manage Users Action
  id: manage-users-action
  uses: ps-resources/manage-users-action@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    organization: owner
    users: user1,user2
    teams: team1,team2
    action: add
```
