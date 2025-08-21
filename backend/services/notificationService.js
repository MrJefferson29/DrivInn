const Notification = require('../models/notification');
const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const HostApplication = require('../models/HostApplication');

class NotificationService {
  // Create a notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Booking notifications
  static async createBookingNotification(bookingId, type = 'booking') {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('listing', 'title owner')
        .populate('guest', 'firstName lastName')
        .populate('hosts', 'firstName lastName');

      if (!booking) return;

      const listing = booking.listing;
      const guest = booking.guest;
      const host = booking.hosts;

      let title, message;

      switch (type) {
        case 'booking':
          title = 'New Booking';
          message = `Your booking for "${listing.title}" has been created successfully.`;
          break;
        case 'booking_confirmed':
          title = 'Booking Confirmed';
          message = `Your booking for "${listing.title}" has been confirmed.`;
          break;
        case 'booking_cancelled':
          title = 'Booking Cancelled';
          message = `Your booking for "${listing.title}" has been cancelled.`;
          break;
        default:
          title = 'Booking Update';
          message = `Your booking for "${listing.title}" has been updated.`;
      }

      // Notify guest
      await this.createNotification({
        user: guest._id,
        type,
        title,
        message,
        booking: bookingId,
        listing: listing._id,
        metadata: {
          bookingId,
          listingTitle: listing.title,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice
        }
      });

      // Notify host
      await this.createNotification({
        user: host._id,
        type,
        title: type === 'booking' ? 'New Booking Request' : title,
        message: type === 'booking' 
          ? `You have a new booking request for "${listing.title}" from ${guest.firstName} ${guest.lastName}.`
          : type === 'booking_confirmed'
          ? `The booking for "${listing.title}" has been confirmed.`
          : type === 'booking_cancelled'
          ? `The booking for "${listing.title}" has been cancelled.`
          : `The booking for "${listing.title}" has been updated.`,
        booking: bookingId,
        listing: listing._id,
        relatedUser: guest._id,
        metadata: {
          bookingId,
          listingTitle: listing.title,
          guestName: `${guest.firstName} ${guest.lastName}`,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice
        }
      });
    } catch (error) {
      console.error('Error creating booking notification:', error);
    }
  }

  // Listing notifications
  static async createListingNotification(listingId, type = 'listing_created', userId = null) {
    try {
      const listing = await Listing.findById(listingId).populate('owner', 'firstName lastName');
      if (!listing) return;

      let title, message;

      switch (type) {
        case 'listing_created':
          title = 'Listing Created';
          message = `Your listing "${listing.title}" has been created successfully.`;
          break;
        case 'listing_updated':
          title = 'Listing Updated';
          message = `Your listing "${listing.title}" has been updated.`;
          break;
        case 'listing_deleted':
          title = 'Listing Deleted';
          message = `Your listing "${listing.title}" has been deleted.`;
          break;
        default:
          title = 'Listing Update';
          message = `Your listing "${listing.title}" has been updated.`;
      }

      await this.createNotification({
        user: listing.owner._id,
        type,
        title,
        message,
        listing: listingId,
        metadata: {
          listingId,
          listingTitle: listing.title,
          listingType: listing.type
        }
      });
    } catch (error) {
      console.error('Error creating listing notification:', error);
    }
  }

  // Host application notifications
  static async createHostApplicationNotification(applicationId, type = 'host_application') {
    try {
      console.log('Creating host application notification:', { applicationId, type });
      
      const application = await HostApplication.findById(applicationId)
        .populate('user', 'firstName lastName email');

      if (!application) {
        console.log('Application not found for notification');
        return;
      }

      if (!application.user) {
        console.log('Application user not found for notification');
        return;
      }

      let title, message;

      switch (type) {
        case 'host_application':
          title = 'Application Submitted';
          message = 'Your host application has been submitted successfully.';
          break;
        case 'host_application_approved':
          title = 'Application Approved!';
          message = 'Congratulations! Your host application has been approved. You can now create listings.';
          break;
        case 'host_application_declined':
          title = 'Application Update';
          message = 'Your host application has been reviewed. Please check the details for more information.';
          break;
        default:
          title = 'Application Update';
          message = 'Your host application has been updated.';
      }

      console.log('Creating notification with data:', {
        user: application.user._id,
        type,
        title,
        message,
        hostApplication: applicationId
      });

      await this.createNotification({
        user: application.user._id,
        type,
        title,
        message,
        hostApplication: applicationId,
        metadata: {
          applicationId,
          status: application.status,
          adminNote: application.adminNote
        }
      });
      
      console.log('Host application notification created successfully');
    } catch (error) {
      console.error('Error creating host application notification:', error);
      throw error; // Re-throw to let the calling function handle it
    }
  }

  // Like notifications
  static async createLikeNotification(listingId, likerId) {
    try {
      const listing = await Listing.findById(listingId).populate('owner', 'firstName lastName');
      const liker = await User.findById(likerId);

      if (!listing || !liker) return;

      await this.createNotification({
        user: listing.owner._id,
        type: 'like',
        title: 'New Like',
        message: `${liker.firstName} ${liker.lastName} liked your listing "${listing.title}".`,
        listing: listingId,
        relatedUser: likerId,
        metadata: {
          listingId,
          listingTitle: listing.title,
          likerName: `${liker.firstName} ${liker.lastName}`
        }
      });
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  }

  // Review notifications
  static async createReviewNotification(reviewId, type = 'review_received') {
    try {
      const Review = require('../models/review');
      const review = await Review.findById(reviewId)
        .populate('listing', 'title owner')
        .populate('reviewer', 'firstName lastName');

      if (!review) return;

      let title, message;

      switch (type) {
        case 'review_received':
          title = 'New Review';
          message = `${review.reviewer.firstName} ${review.reviewer.lastName} left a review for your listing "${review.listing.title}".`;
          break;
        default:
          title = 'Review Update';
          message = `A review has been updated for your listing "${review.listing.title}".`;
      }

      await this.createNotification({
        user: review.listing.owner._id,
        type,
        title,
        message,
        review: reviewId,
        listing: review.listing._id,
        relatedUser: review.reviewer._id,
        metadata: {
          reviewId,
          listingTitle: review.listing.title,
          reviewerName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
          rating: review.rating
        }
      });
    } catch (error) {
      console.error('Error creating review notification:', error);
    }
  }

  // Payment notifications
  static async createPaymentNotification(paymentId, type = 'payment_successful') {
    try {
      const Payment = require('../models/payment');
      const payment = await Payment.findById(paymentId)
        .populate('booking', 'listing')
        .populate('user', 'firstName lastName');

      if (!payment) return;

      let title, message;

      switch (type) {
        case 'payment_successful':
          title = 'Payment Successful';
          message = 'Your payment has been processed successfully.';
          break;
        case 'payment_failed':
          title = 'Payment Failed';
          message = 'Your payment could not be processed. Please try again.';
          break;
        default:
          title = 'Payment Update';
          message = 'Your payment status has been updated.';
      }

      await this.createNotification({
        user: payment.user._id,
        type,
        title,
        message,
        payment: paymentId,
        metadata: {
          paymentId,
          amount: payment.amount,
          status: payment.status
        }
      });
    } catch (error) {
      console.error('Error creating payment notification:', error);
    }
  }

  // System notifications
  static async createSystemNotification(userId, title, message, type = 'system') {
    try {
      await this.createNotification({
        user: userId,
        type,
        title,
        message,
        metadata: {
          systemNotification: true
        }
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  // Welcome notification for new users
  static async createWelcomeNotification(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await this.createNotification({
        user: userId,
        type: 'welcome',
        title: 'Welcome to DrivInn!',
        message: `Welcome ${user.firstName}! We're excited to have you on board. Start exploring amazing places to stay.`,
        metadata: {
          welcomeNotification: true
        }
      });
    } catch (error) {
      console.error('Error creating welcome notification:', error);
    }
  }

  // Reminder notifications
  static async createReminderNotification(userId, title, message) {
    try {
      await this.createNotification({
        user: userId,
        type: 'reminder',
        title,
        message,
        priority: 'medium',
        metadata: {
          reminderNotification: true
        }
      });
    } catch (error) {
      console.error('Error creating reminder notification:', error);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get unread notification count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ user: userId, read: false });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = NotificationService; 