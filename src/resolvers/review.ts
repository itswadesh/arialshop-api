import { Types } from 'mongoose'
import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, ReviewDocument } from '../types'
import { objectId } from '../validation'
import {
  Order,
  OrderItem,
  Product,
  Review,
  Setting,
  Store,
  User,
} from '../models'
import { fields, index, updateStats } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    reviews: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('You are not authorized')
      if (user.role != 'admin' && user.role !== 'super')
        args['items.vendor'] = userId
      args.populate = 'pid user vendor store'
      //checking store
      const settings = await Setting.findOne()
      if (!settings) throw new Error('Something went wrong')
      let isMultiStore = false
      if (settings.isMultiStore) isMultiStore = true

      return index({ model: Review, args, info, isMultiStore })
    },
    review: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<ReviewDocument | null> => {
      try {
        await objectId.validateAsync(args)
        return Review.findById(args.id, fields(info)).populate(
          'pid user vendor store'
        )
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    productReviews: async (
      root,
      args: {
        active: boolean
        sort: string
        pid: string
        populate: string
      },
      ctx,
      info
    ) => {
      args.active = true
      args.sort = '-createdAt'
      args.populate = 'user'
      try {
        return index({ model: Review, args, info })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    reviewSummary: async (root, args, ctx, info) => {
      try {
        const reviews = await Review.aggregate([
          { $match: { pid: Types.ObjectId(args.pid) } },
          {
            $group: {
              _id: '$pid',
              avg: { $avg: '$rating' },
              count: { $sum: 1 },
              total: { $sum: '$rating' },
              reviews: { $addToSet: '$message' },
            },
          },
          {
            $project: {
              _id: 1,
              avg: '$avg',
              count: 1,
              total: 1,
              reviews: 1,
            },
          },
        ])
        return reviews[0]
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    // vote = async (req, res) => {
    //   try {
    //     if (req.body._id) {
    //       delete req.body._id;
    //     }
    //     req.body.uid = req.user._id;
    //     req.body.email = req.user.email;
    //     req.body.phone = req.user.phone;
    //     let data = await this.model.findOne({ _id: req.params.id }).exec()
    //     //   includes(data.votes.voters, "" + req.user._id.toString() + ""), data.votes.voters.indexOf(req.user._id));
    //     let count = req.params.count
    //     let found = find(data.votes.voters, function (o) {
    //       return (o.uid.toString() == req.user._id.toString());
    //     });
    //     if (!found && count == '1') { //Not found | +1 request -> allow
    //       data.votes.count++;
    //       data.votes.voters.push({ uid: req.user._id, vote: 1 }) // Add user to voters
    //     } else if (!found && count == '0') { //Not found | -1 request -> allow
    //       data.votes.count--;
    //       data.votes.voters.push({ uid: req.user._id, vote: -1 }) // Add user to voters
    //     } else if (!!found && found.vote == 1 && count == 0) { // Found | +1 exists | -1 request => Allow
    //       data.votes.count--;
    //       data.votes.voters = remove(data.votes.voters, function (v: any) {
    //         return (v.uid.toString() != req.user._id.toString());
    //       });
    //     } else if (!!found && found.vote == -1 && count == 1) { // Found | -1 exists | +1 request => Allow
    //       data.votes.count++;
    //       data.votes.voters = remove(data.votes.voters, function (v: any) {
    //         return (v.uid.toString() != req.user._id.toString());
    //       });
    //     } else { //If trying to vote twice -> block
    //       res.status(403).json('You have already voted for this');
    //       return
    //     }
    //     req.body.votes = data.votes
    //     let result = await this.model.update({ _id: req.params.id }, { $set: req.body }).exec()
    //     if (result.nModified == 0) {
    //       res.status(202).json('No changes to modify');
    //       return null;
    //     }
    //     else {
    //       res.status(200).json(req.body);
    //     }
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).send(err);
    //   }
    // }
  },
  Mutation: {
    removeReview: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<boolean> => {
      const { userId } = req.session
      try {
        const review = await Review.findById(args.id)
        if (!review) throw new UserInputError('Review not found')
        const user = await User.findById(userId)
        if (!user) throw new UserInputError('Please login again to continue')
        if (
          user.role != 'admin' &&
          user.role !== 'super' &&
          review.user == userId
        )
          throw new UserInputError('Review does not belong to you')
        const r = await Review.deleteOne({ _id: args.id })
        return r.ok == 1
        // return await Review.findByIdAndDelete({ _id: args.id })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    saveReview: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<ReviewDocument | null> => {
      // console.log('AAA', args)
      const { userId } = req.session
      try {
        const settings = await Setting.findOne({}).exec()
        if (!settings) throw new UserInputError('Invalid settings')
        if (settings.review.moderate) req.body.active = false

        const user = await User.findById(userId)
        if (!user) throw new Error('please login again')

        if (args.id == 'new') {
          delete args.id
          const product = await Product.findById(args.pid)
          if (!product) throw new UserInputError('Product not found')
          const order = await Order.findOne({
            'items.pid': new ObjectId(product._id),
            user: userId,
          })
            .sort({ $natural: -1 })
            .populate({
              path: 'items orderItems',
              populate: {
                path: 'orderStatus',
              },
            })
          if (!order)
            throw new UserInputError('You have never ordered this item')
          const p = order.items.find((element) => element.pid == args.pid)
          //check item delivered or not
          if (p.status) {
            if (String(p.status).toLowerCase() != 'delivered') {
              throw new Error('please wait until product delivered')
            }
          }

          if (p.reviewed)
            throw new UserInputError('You have already reviewed this item...')

          p.reviewed = true
          let store
          if (settings.isMultiStore) {
            store = product.store
          }
          const review = await Review.findOneAndUpdate(
            { _id: args.id || Types.ObjectId() },
            {
              ...args,
              user: userId,
              vendor: product.vendor,
              store,
            },
            { new: true, upsert: true }
          )
          // .populate('pid user')
          await review.save()
          updateStats(product)
          await Order.updateMany(
            { 'items.pid': new ObjectId(product._id), user: userId },
            { $set: { 'items.$.reviewed': true } }
          )
          //also update OrderItem
          await OrderItem.updateMany(
            { pid: new ObjectId(product._id), user: userId },
            { $set: { reviewed: true } }
          )
          return review
        } else {
          if (user.role != 'admin' && user.role !== 'super')
            throw new Error('only admin can access')
          const review = await Review.findByIdAndUpdate(args.id, args, {
            new: true,
          })
          return review
        }
        // To fire pre save hoook
        // await order.save()
        // await Order.updateMany({ 'items.pid': new ObjectId(product._id), 'user': userId }, { $set: { 'items.$.reviewed': true } })
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}

export default resolvers
