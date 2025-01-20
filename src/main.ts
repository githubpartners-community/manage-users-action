import {error, getInput, info, setFailed} from '@actions/core'
import {getOctokit} from '@actions/github'

async function validate(token: string, users: string[], organization: string, teams: string[]): Promise<boolean> {
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

  try {
    await octokit.rest.orgs.get({org: organization})
  } catch (e) {
    invalid = true
    errorMessage += `Organization ${organization} does not exist.\n`
  }

  for (const team of teams) {
    try {
      await octokit.rest.teams.getByName({
        org: organization,
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

    const organization: string = getInput('organization', {required: true})
    info(`organization: ${organization}`)

    const action: string = getInput('action')
    info(`action: ${action}`)

    const teams: string[] = getInput('teams', {required: true}).replace(/\s/g, '').split(',')
    info(`teams: ${teams}`)
    for (const team of teams) {
      info(`team: ${team}`)
    }

    if (!(await validate(token, users, organization, teams))) return

    const octokit = getOctokit(token)

    for (const user of users) {
      if (action === 'add') {
        for (const team of teams) {
          info(`Adding ${user} to team ${team}`)
          await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
            org: organization,
            team_slug: team,
            username: user,
            role: 'member'
          })
        }
      } else if (action === 'remove') {
        info(`Removing ${user} from organization ${organization}`)
        await octokit.rest.orgs.removeMembershipForUser({
          org: organization,
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
