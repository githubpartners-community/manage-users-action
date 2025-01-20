# Manage Users Action

This GitHub action adds and removes multiple users from multiple repositories repositories.

If a user is already part of the repository, running it again with a different `permission` will change the permission of the user.

A user will be removed from the repository regardless whether the user accepted the invitation. A pending invitation will be cancelled.

---

## Inputs

| NAME           | DESCRIPTION                                                                                    | TYPE     | REQUIRED | DEFAULT |
| -------------- | ---------------------------------------------------------------------------------------------- | -------- | -------- | ------- |
| `token`        | A GitHub token with access to the target repositories                                          | `string` | `true`   | `N/A`   |
| `users`        | Comma-separated GitHub slug of users to provide access to.                                     | `string` | `true`   | `N/A`   |
| `repositories` | Comma-separated GitHub slug of repositories to provide access to (format <owner>/<repo_name>). | `string` | `true`   | `N/A`   |
| `action`       | The action to perform. Add or Remove.                                                          | `string` | `true`   | `N/A`   |
| `role`         | Role of the user in the repository. Only required if action is add.                            | `string` | `false`  | `N/A`   |

---

## Usage example

Add the following snippet to an existing workflow file:

```yml
- name: Run Manager Users Action
  id: manager-users-action
  uses: ps-resources/manage-users-action@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    repositories: owner/repo1,owner/repo2
    users: user1,user2
    role: push
    action: add
```
