import {error, getInput, info, setFailed} from '@actions/core'
import {getOctokit} from '@actions/github'

async function validate(token: string, users: string[], repositories: string[], team?: string): Promise<boolean> {
  const octokit = getOctokit(token)

  let invalid = false
  let errorMessage = ''
  for (const user of users) {
    try {
      await octokit.rest.users.getByUsername({username: user})
    } catch (e) {
      invalid = true
      errorMessage += `User ${user} does not exist.\n`
    }
  }

  for (const repository of repositories) {
    try {
      await octokit.rest.repos.get({
        owner: repository.split('/')[0],
        repo: repository.split('/')[1]
      })
    } catch (e) {
      invalid = true
      errorMessage += `Repository ${repository} does not exist.\n`
    }
  }

  if (team) {
    try {
      await octokit.rest.teams.getByName({
        org: repositories[0].split('/')[0],
        team_slug: team
      })
    } catch (e) {
      invalid = true
      errorMessage += `Team ${team} does not exist.\n`
    }
  }

  if (invalid) {
    error(errorMessage)
    setFailed(errorMessage)
    return false
  }

  return true
}

async function run(): Promise<void> {
  info(`Starting action...`)

  const token = getInput('token', {required: true})

  try {
    const users: string[] = getInput('users').replace(/\s/g, '').split(',')
    for (const user of users) {
      info(`user: ${user}`)
    }

    const repositories: string[] = getInput('repositories').replace(/\s/g, '').split(',')
    for (const repository of repositories) {
      info(`repository: ${repository}`)
    }

    const role = getInput('role') as 'pull' | 'push' | 'admin' | 'maintain' | 'triage' | undefined
    info(`role: ${role}`)

    const action: string = getInput('action')
    info(`action: ${action}`)

    const team = action === 'add' ? getInput('team', {required: true}) : undefined
    if (team) {
      info(`team: ${team}`)
    }

    if (!validate(token, users, repositories, team)) return

    const octokit = getOctokit(token)

    for (const user of users) {
      if (action === 'add') {
        info(`Adding ${user} to team ${team}`)
        await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
          org: repositories[0].split('/')[0],
          team_slug: team!,
          username: user,
          role: 'member'
        })
      } else if (action === 'remove') {
        info(`Removing ${user} from organization`)
        await octokit.rest.orgs.removeMembershipForUser({
          org: repositories[0].split('/')[0],
          username: user
        })
      } else {
        throw new Error('Action must be add or remove')
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error(`Error managing users in teams: ${e.message}`)
      setFailed(e.message)
    }
  }
  info(`Finished action.`)
}

run()
