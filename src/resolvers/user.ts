import { Types } from 'mongoose'
import { nanoid } from 'nanoid'
const { OAuth2Client } = require('google-auth-library')
import { PasswordReset, Setting, Slug, Store, User, Wallet } from '../models'
import {
  IResolvers,
  UserInputError,
  AuthenticationError,
} from 'apollo-server-express'
import {
  Request,
  Response,
  UserDocument,
  InfoDocument,
  AddressDocument,
} from '../types'
import {
  objectId,
  signInOtp,
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendEmailSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from '../validation'
import {
  logIn,
  verifyOtp,
  signOut,
  markAsVerified,
  resetPassword,
} from '../auth'
import {
  fields,
  generateOTP,
  index,
  requestOTP,
  merge,
  checkOtpAttemp,
  sendMail,
  addCustomerInLulu,
  createUserHook,
  googleLogIn,
} from '../utils'
import {
  OTP_SHORT_GAP,
  OTP_LONG_GAP,
  OTP_MAX_RETRY,
  PHONE_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  WWW_URL,
  GOOGLE_CLIENT_ID,
} from '../config'
import { String } from 'aws-sdk/clients/cloudhsm'

const resolvers: IResolvers = {
  Query: {
    me: async (
      root,
      args,
      { req, res }: { req: Request; res: Response },
      info
    ): Promise<UserDocument | null> => {
      try {
        const { userId } = req.session
        const me = await User.findById(userId, fields(info))
          .populate('address roles')
          .exec()
        if (!me) throw new UserInputError('user not exist')
        if (!me.active) {
          signOut(req, res)
          throw new UserInputError('user is inactive')
        }
        return me
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    allUsers: (root, args, { req }: { req: Request }, info) => {
      try {
        return index({ model: User, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    users: async (root, args, { req }: { req: Request }, info) => {
      try {
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        let isMultiStore = false
        if (settings.isMultiStore) isMultiStore = true

        return index({ model: User, args, info, isMultiStore })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    user: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<UserDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return User.findById(args.id, fields(info))
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    userSummary: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = Types.ObjectId(store._id)
        }

        const data = await User.aggregate([
          { $match: args },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              updatedAt: { $max: '$updatedAt' },
            },
          },
        ])
        return data[0]
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    topVendors: async (root, args, { req }: { req: Request }, info) => {
      try {
        const { userId } = req.session
        let limit = args.limit || 5
        delete args.limit
        //checking store
        const settings = await Setting.findOne()
        if (!settings) throw new Error('Something went wrong')
        if (settings.isMultiStore) {
          const user = await User.findById(userId)
          if (!user.store) throw new Error('You have not own a store')
          const store = await Store.findById(user.store)
          if (!store) throw new Error('Your store does not exist')
          args.store = store._id
        }
        // args.role = 'vendor' //old
        args.role = { $in: ['manager', 'admin', 'super', 'vendor'] }
        const data = await User.find({ ...args })
          .sort({ productSold: -1 })
          .limit(limit)
        return data
      } catch (err) {
        console.log(err)
      }
    },
  },

  Mutation: {
    removeUser: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const user1 = await User.findById(args.id)
        if (!user1) throw new UserInputError('User not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        await Slug.deleteOne({ slug: user.slug })
        const s = await User.deleteOne({ _id: args.id })
        return s.ok == 1
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    sendInvitation: async (
      root,
      args: {
        emails: string
      },
      { req }: { req: Request },
      info
    ): Promise<boolean> => {
      // const WWW_URL = req.headers.origin
      const settings = await Setting.findOne({}).select('websiteName')
      const emails = args.emails
      const { userId } = req.session!
      try {
        for (const email of emails.split(',')) {
          sendMail({
            to: email,
            subject: settings.websiteName + ' Referal',
            template: 'user/referal',
            context: {
              url: `${WWW_URL}/signup?referrer=${userId}`,
            },
          })
        }
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    emailPassword: async (
      root,
      args: {
        email: string
        referrer: string
      },
      { req }: { req: Request },
      info
    ): Promise<string> => {
      try {
        // validate(forgotPasswordSchema, args)
        const email = args.email
        const referrer = args.referrer
        const settings = await Setting.findOne({}).select('websiteName')
        const user = await User.findOne({ email })
        if (!user)
          throw new UserInputError('No account with that email address exists.')

        // @ts-ignore
        const token = PasswordReset.plaintextToken()
        const reset = new PasswordReset({ userId: user.id, token, referrer })
        await reset.save()
        sendMail({
          to: email,
          subject: settings.websiteName + ' Password Reset Request',
          template: 'user/reset-password',
          context: {
            url: reset.url(token, referrer),
          },
        })
        return 'You will receive an email with a link to reset your password'
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    resetPassword: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<boolean> => {
      try {
        await validate(resetPasswordSchema, args)
        const settings = await Setting.findOne({}).select('websiteName')
        const { id, token, password, passwordConfirmation } = args
        const reset = await PasswordReset.findById(id)
        let user
        if (
          !reset ||
          !reset.isValid(token) ||
          !(user = await User.findById(reset.userId))
        ) {
          throw new UserInputError('Invalid password reset token')
        }
        await Promise.all([
          resetPassword(user, password),
          PasswordReset.deleteMany({ userId: reset.userId }),
        ])
        sendMail({
          to: user.email,
          subject: settings.websiteName + ' Password Changed',
          template: 'user/change-password',
          context: user,
        })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    resendEmail: async (
      root,
      args: {
        email: string
      },
      { req }: { req: Request },
      info
    ): Promise<string> => {
      try {
        await validate(resendEmailSchema, args)
        const { email } = args
        const settings = await Setting.findOne({}).select('websiteName')
        const user = await User.findOne({ email }).select('email verifiedAt')
        if (user && !user.verifiedAt) {
          const link = user.verificationUrl()
          sendMail({
            to: email,
            subject: settings.websiteName + ' Verify your email address',
            template: 'user/verify',
            context: { link },
          })
        }
        return 'If your email address needs to be verified, you will receive an email with the activation link'
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    verifyEmail: async (
      root,
      args: {
        id: string
        query: string
        originalUrl: string
      },
      { req }: { req: Request },
      info
    ): Promise<boolean> => {
      try {
        await validate(verifyEmailSchema, args)
        const { id } = args
        const user = await User.findById(id).select('verifiedAt')
        if (
          !user ||
          // @ts-ignore
          !User.hasValidVerificationUrl(args.originalUrl, args.query)
        ) {
          throw new UserInputError('Invalid activation link')
        }
        if (user.verifiedAt) {
          throw new UserInputError('Email already verified')
        }
        await markAsVerified(user)
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    changePassword: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<boolean> => {
      try {
        await validate(changePasswordSchema, args)
        const { oldPassword, password } = args
        const { userId } = req.session
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('User not registered') //Invalid old password provided
        if (!(await user.matchesPassword(oldPassword)))
          throw new AuthenticationError(
            'Incorrect old password. Please try again.'
          )
        user.password = password
        user.save()
        sendMail({
          to: user.email,
          subject: ' Password Changed',
          template: 'user/change-password',
          context: user,
        })
        return true
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    updateProfile: async (
      root,
      args: {
        id: string
        firstName: string
        lastName: string
        email: string
        avatar: string
        role: string
        verified: boolean
        info: InfoDocument
        address: AddressDocument
        slug: string
        shippingCharges: number
        freeShippingOn: number
      },
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      const { userId } = req.session
      const { email } = args
      try {
        let user = await User.findById(userId)
        if (email) {
          if (email != user.email) {
            let res = await User.find({ email }).countDocuments()
            if (res > 0)
              throw new Error(
                'Email already registered with another account,please try with another email'
              )
          }
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $set: args },
          { new: true }
        )
        // console.log('in update profile args is', args)
        //To fire preSave Hook
        await updatedUser.save()
        return updatedUser
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    saveUser: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new') {
        delete args.id
        if (args.email) {
          let res = await User.find({ email: args.email }).countDocuments()
          if (res > 0)
            throw new Error(
              'Email already registered with another account,please try with another email'
            )
        }
      } else {
        const userData = await User.findById(args.id)
        if (!userData) throw new Error('user not exist')
        if (args.email) {
          if (args.email != userData.email) {
            let res = await User.find({ email: args.email }).countDocuments()
            if (res > 0)
              throw new Error(
                'Email already registered with another account,please try with another email'
              )
          }
        }
      }
      // console.log('args are for save user are:', args)
      try {
        let user = await User.findOneAndUpdate(
          { _id: args.id || Types.ObjectId() },
          { $set: { ...args, createdBy: userId } },
          { upsert: true, new: true }
        )
        user = await user.save() //fir pre saveHook
        return user
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveBusinessDetail: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      const { userId } = req.session
      // console.log('args are for save user are:', args)
      // const businessDetail = {...args}
      try {
        const user = await User.findOneAndUpdate(
          { _id: userId || Types.ObjectId() },
          { $set: { businessDetail: { ...args } } },
          { upsert: true, new: true }
        )
        await user.save()
        return user
      } catch (e) {
        throw new UserInputError(e)
      }
    },

    verifyOtp: async (
      root,
      args: { phone: string; otp: string },
      { req, res }: any,
      info
    ): Promise<UserDocument> => {
      if (args.phone) args.phone = args.phone.replace(/\s/g, '')
      if (args.otp) args.otp = args.otp.replace(/\s/g, '')
      await signInOtp.validateAsync(args, { abortEarly: false })
      const user = await verifyOtp(args, fields(info))
      logIn(req, user.id)
      await merge(req)
      user.lastSignIn = new Date()
      user.otpAttemp = 0
      const sid = req.sessionID
      user.sid = sid // If this does not work, create a api endpoint which will call this and collect the response headers and send back
      await user.save()
      return user
    },

    getOtp: async (
      root,
      args: {
        phone: string
        refCodeBy: string
        requestType: string
        role: string
      },
      { req }: { req: Request }
    ): Promise<{ otp: number; timer: number }> => {
      try {
        if (args.phone) args.phone = args.phone.replace(/\s/g, '')
        if (
          args.phone.length < PHONE_MIN_LENGTH ||
          args.phone.length > PHONE_MAX_LENGTH
        )
          throw new Error(
            'Not a valid phone number, Please enter a valid number'
          )

        const settings = await Setting.findOne()
        if (!settings) throw new UserInputError('No settings')
        let otp = generateOTP()
        // if (!settings.sms.enabled)
        // Dummy account for testing purpose
        // if (args.phone == '+919786978697') {
        //   otp = 9786
        // }
        let user = await User.findOne({ phone: args.phone })

        if (!user) {
          const code = nanoid(5)
          user = new User({
            phone: args.phone,
            password: otp.toString(),
            refCodeBy: args.refCodeBy,
            role: args.role,
          })
          await user.save()
        } else {
          if (!user.active) throw new Error('user is inactive')
          user.password = otp.toString()
          await user.save()
        }
        // console.log('user.phone,user.otp_timezzzzzzzzzzzzzzzzzz',user.phone,user.otp_attemp);
        await checkOtpAttemp(user)
        user.otpAttemp = user.otpAttemp + 1
        user.otpTime = new Date()
        // console.log('before save user is:', user)
        await user.save()

        let timer
        if (user.otpAttemp >= OTP_MAX_RETRY) timer = OTP_LONG_GAP
        else timer = OTP_SHORT_GAP
        //send otp to phone
        requestOTP(args.phone, otp)
        await createUserHook(user)
        return { otp: 0, timer }
      } catch (err) {
        throw new UserInputError(err)
      }
    },

    register: async (
      root,
      args: {
        email: string
        phone: string
        firstName: string
        lastName: string
        password: string
        passwordConfirmation: String
        referrer: string
        referralCode: string
      },
      { req }: { req: Request }
    ): Promise<UserDocument> => {
      try {
        if (args.phone) args.phone = args.phone.replace(/\s/g, '')
        await validate(registerSchema, args)
        const {
          email,
          firstName,
          lastName,
          password,
          referrer,
          referralCode,
          phone,
        } = args
        if (!email) throw 'Email must be provide'
        const setting = await Setting.findOne()
        if (!setting) throw 'default setting error'

        let found = await User.exists({ email })
        if (found) throw 'User already registed with us'
        //in case of referral code not provided then easily signUp and return
        if (!referralCode) {
          const code = nanoid(5)
          const user = new User({
            firstName,
            lastName,
            phone,
            email,
            password,
            referrer,
            referralCode: code,
            lastSignIn: new Date(),
          })
          await user.save()
          logIn(req, user.id)
          return user
        }
        // console.log("Refer code provided")
        // find the refel code user
        const userWhoRefered = await User.findOne({ referralCode })
        if (!userWhoRefered) throw 'Please Enter Correct RefCode or Keep Blank '
        //If user not exist already then we will createit
        const code = nanoid(5)
        let user = new User({
          firstName,
          lastName,
          phone,
          email,
          password,
          referralCode: code,
          referedFrom: userWhoRefered.id,
          lastSignIn: new Date(),
        })
        user = await user.save()
        logIn(req, user.id)
        const wallet1 = new Wallet({
          user: user.id,
          amount: setting.joiningBonus,
          direction: '+',
          remark: `Joining Bonus`,
          balance: user.currentBalance + setting.joiningBonus,
        })
        const newWallet1 = await wallet1.save()
        await User.findByIdAndUpdate(
          user.id,
          {
            $addToSet: { walletId: newWallet1.id },
            $set: { currentBalance: newWallet1.balance },
          },
          { new: true }
        )
        //lets add the new user into userWho refered
        await User.findByIdAndUpdate(userWhoRefered.id, {
          $addToSet: { referedUsers: user.id },
        })
        //make wallet for bonus add
        const wallet = new Wallet({
          user: userWhoRefered.id,
          amount: setting.referralBonus,
          direction: '+',
          remark: `referrel bonus of ${user.email}`,
          referedUser: user.id,
          balance: userWhoRefered.currentBalance + setting.referralBonus,
        })
        const newWallet = await wallet.save()
        await User.findByIdAndUpdate(userWhoRefered.id, {
          $addToSet: { walletId: newWallet.id },
        })
        // let currentBalance = userWhoRefered.currentBalance
        await User.findByIdAndUpdate(userWhoRefered.id, {
          $set: {
            currentBalance: userWhoRefered.currentBalance + newWallet.amount,
          },
        })
        return user
      } catch (e) {
        throw new Error(e)
      }
    },

    login: async (
      root,
      args: { email: string; password: string },
      { req, res }: { req: Request; res: Response },
      info
    ): Promise<UserDocument> => {
      // try {
      await validate(loginSchema, args)
      const { email, password } = args
      const user = await User.findOne({ email }).collation({
        locale: 'tr',
        strength: 2,
      })
      if (!user || !(await user.matchesPassword(password))) {
        throw new Error('Incorrect email or password')
      }
      if (!user.active) {
        signOut(req, res)
        throw new Error('user is inactive')
      }
      logIn(req, user.id)
      await merge(req) // Merge guest cart with the logged in user session
      user.lastSignIn = new Date()
      user.otpAttemp = 0
      await user.save()
      return user
      // } catch (e) {
      //   throw new Error(e)
      // }
    },

    signOut: (
      root,
      args,
      { req, res }: { req: Request; res: Response }
    ): Promise<boolean> => {
      // try {
      return signOut(req, res)
      // } catch (e) {
      //   throw new Error(e)
      // }
    },

    googleOneTap: async (
      root,
      args: { credential: string },
      { req }: { req: Request },
      info
    ): Promise<UserDocument> => {
      try {
        const client = new OAuth2Client(GOOGLE_CLIENT_ID)
        // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', req.body)
        // console.log('calling googleOTap')
        const ticket = await client.verifyIdToken({
          idToken: args.credential,
          audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        })
        const payload = ticket.getPayload()
        console.log('payload', payload)
        const userid = payload['sub']
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        if (!payload) throw new Error('Ticket not received')
        return await googleLogIn(req, payload)
      } catch (err) {
        throw new UserInputError(err)
      }
    },

    referrelUser: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      try {
        //first find the refel code user
        const userWhoRefered = await User.findOne({
          referralCode: args.referralCode,
        })
        if (userWhoRefered == null) {
          throw new Error('Referel Code incorrect ')
        }
        if (args.phone.length < 10 || args.phone.length > 10) {
          throw new Error('Please enter valid phone number ')
        }

        //lets check phone number already exist or not
        const checkUser = await User.findOne({ phone: args.phone })
        if (checkUser) {
          throw new Error(
            'Phone Number already exist in database,please choose another phone Number. '
          )
        }
        //create  new user with phone number
        const code = nanoid(5)
        const user = new User({
          phone: args.phone,
          referralCode: code,
          referedFrom: userWhoRefered.id,
        })
        const newUser = await user.save()
        // lets update the user whose refered
        await User.findByIdAndUpdate(userWhoRefered.id, {
          $addToSet: { referedUsers: newUser.id },
        })
        const wallet = new Wallet({
          userId: userWhoRefered.id,
          amount: 100,
          direction: '+',
          remark: 'referrel bonus',
          referedUser: newUser.id,
          balance: userWhoRefered.currentBalance + args.amount,
        })
        const newWallet = await wallet.save()

        await User.findByIdAndUpdate(userWhoRefered.id, {
          $addToSet: { walletId: newWallet.id },
        })
        // let currentBalance = userWhoRefered.currentBalance
        await User.findByIdAndUpdate(userWhoRefered.id, {
          $set: {
            currentBalance: userWhoRefered.currentBalance + newWallet.amount,
          },
        })
        return newUser
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    attachUserToStore: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      try {
        const { storeId, userId } = args
        const store = await Store.findById(storeId)
        if (!store) throw new Error('Store not exist')
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $set: { store: storeId } },
          { new: true }
        )
        return updatedUser
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    removeUserFromStore: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<UserDocument | null> => {
      try {
        const { storeId, userId } = args
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $unset: { store: '' } },
          { new: true }
        )
        return updatedUser
      } catch (err) {
        throw new UserInputError(err)
      }
    },
  },
}

export default resolvers
