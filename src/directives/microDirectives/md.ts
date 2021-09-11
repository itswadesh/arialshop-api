import { ensureSignedIn } from '../../auth'
import { User } from '../../models'
import { UserInputError } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

export const md = (name: string, field: any) => {
  const { resolve = defaultFieldResolver } = field

  field.resolve = async function (...args) {
    const [, , context] = args

    ensureSignedIn(context.req)
    const user = await User.findById(context.req.session.userId)
      .populate('roles')
      .select('roles')
    if (!user) throw new UserInputError('User not found')
    let authorized = false
    for (let role of user.roles) {
      if (role.name == 'super') {
        authorized = true
        break
      }
      for (let m of role.roles) {
        if (String(m) == name) {
          authorized = true
          break
        }
      }
    }
    if (!authorized)
      throw new UserInputError(
        'Sorry!!!. You are not authorized to delete brand'
      )
    return resolve.apply(this, args)
  }
}
