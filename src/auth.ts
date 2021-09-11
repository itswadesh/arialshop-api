import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server-express'
import { User } from './models'
import { Request, Response } from 'express'
import { UserDocument } from './types'
import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'

export const logIn = (req: Request, userId: string) => {
  // @ts-ignore
  req.session!.userId = userId
  // @ts-ignore
  req.session!.createdAt = Date.now()
}

export const verifyOtp = async (
  { phone, otp }: { phone: string; otp: string },
  fields: string
): Promise<UserDocument> => {
  const user = await User.findOne({ phone }).select(`${fields} password`)
  if (!user || !(await user.matchesPassword(otp))) {
    throw new AuthenticationError('Incorrect otp. Please try again.')
  }
  if (!user.active) throw new Error('user is inactive')
  return user
}
export const attemptSignIn = async (
  { email, password }: { email: string; password: string },
  fields: string
): Promise<UserDocument> => {
  const user = await User.findOne({ email }).select(`${fields} password`)

  if (!user || !(await user.matchesPassword(password))) {
    throw new AuthenticationError(
      'Incorrect email or password. Please try again.'
    )
  }

  return user
}

export const localLogin = async (
  req: Request,
  { email, password }: { email: string; password: string },
  fields: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    return passport.authenticate('local', (err, user) => {
      if (err) reject(err)

      req.login(user, (err) => {
        if (err) reject(err)
        resolve(user)
      })
    })({ body: { email, password } })
  })
}

// @ts-ignore
export const isLoggedIn = (req: Request): boolean => !!req.session!.userId

export const ensureSignedIn = (req: Request): void => {
  if (!isLoggedIn(req)) {
    throw new AuthenticationError('You must be signed in.')
  }
}

export const ensureSignedOut = (req: Request): void => {
  if (isLoggedIn(req)) {
    throw new AuthenticationError('You are already signed in.')
  }
}

export const signOut = (req: Request, res: Response): Promise<boolean> =>
  new Promise((resolve, reject) => {
    // @ts-ignore
    req.session!.userId = null
    resolve(true)
    // req.session!.destroy((err: Error) => {
    //   if (err) reject(err)

    //   res.clearCookie(SESSION_NAME)

    //   resolve()
    // })
  })

export const markAsVerified = async (user: UserDocument) => {
  user.verifiedAt = new Date()
  await user.save()
}

// export const changePassword = async (
//   userId: string,
//   oldPassword: string,
//   password: string
// ) => {
//   const user = await User.findById(userId)
//   if (!user) throw new UserInputError('User not registered') //Invalid old password provided
//   if (!(await user.matchesPassword(oldPassword)))
//     throw new AuthenticationError(
//       'Incorrect old password. Please try again...0'
//     )
//   user.password = password
//   user.save()
//   sendMail({
//     to: user.email,
//     subject: ' Password Changed',
//     template: 'user/change-password',
//     context: user,
//   })
//   return user
// }

export const resetPassword = async (user: UserDocument, password: string) => {
  user.password = password
  await user.save()
}

passport.serializeUser((user: UserDocument, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err: Error, user: UserDocument) => done(err, user)) // gets called on each req :-/
})

export default passport
