// class AppLink {
//   static const String server = "https://admin.umrahgo.net/api/v1";
//   static const String test = "$server/";
//   static const String reigester_user_api = "$server/auth/register";
//   static const String getAllOfficeData = "$server/public/offices";
// }

class AppLink {
  // Base URL
  static const String server = "https://admin.umrahgo.net/api/v1";

  // Authentication Endpoints
  static const String authBase = "$server/auth";
  static const String registerUser = "$authBase/register";
  static const String registerOffice = "$authBase/register/office";
  static const String registerOperator = "$authBase/register/operator";
  static const String login = "$authBase/login";
  static const String logout = "$authBase/logout";
  static const String currentUser = "$authBase/user";
  static const String otpSend = "$authBase/otp/send";
  static const String otpVerify = "$authBase/otp/verify";
  static const String otpResend = "$authBase/otp/resend";
  static const String forgotPassword = "$authBase/password/forgot";
  static const String resetPassword = "$authBase/password/reset";
  static const String socialLogin =
      "$authBase/social"; // Add provider parameter when using

  // User Profile Endpoints
  static const String userProfile = "$server/user/profile";
  static const String userProfilePhoto = "$server/user/profile/photo";
  static const String userPassword = "$server/user/password";

  // Notifications Endpoints
  static const String notifications = "$server/notifications";
  static const String notificationsUnreadCount = "$notifications/unread-count";
  static const String notificationsReadAll = "$notifications/read-all";
  // Use "$notifications/{id}/read" for marking specific notification as read
  // Use "$notifications/{id}" for deleting specific notification

  // Public Endpoints
  static const String publicBase = "$server/public";

  // Settings Endpoints
  static const String settings = "$publicBase/settings";
  static const String appInfo = "$settings/app-info";

  // Packages Endpoints
  static const String packages = "$publicBase/packages";
  static const String featuredPackages = "$packages/featured";
  static const String popularPackages = "$packages/popular";

  // Hotels Endpoints
  static const String hotels = "$publicBase/hotels";
  static const String hotelsByPackage =
      "$hotels/package"; // Add package_id when using

  // Buses Endpoints
  static const String buses = "$publicBase/buses";
  static const String busTypes = "$buses/types";

  // Bus Operators Endpoints
  static const String operators = "$publicBase/operators";
  static const String popularOperators = "$operators/popular";

  // Umrah Offices Endpoints
  static const String offices = "$publicBase/offices";
  static const String featuredOffices = "$offices/featured";
  static const String topRatedOffices = "$offices/top-rated";

  // Bookings Endpoints
  static const String bookings = "$server/bookings";
  // Use "$bookings/{id}/cancel" for canceling a booking
  // Use "$bookings/{id}/invoice" for getting invoice
  // Use "$bookings/{id}/invoice/download" for downloading invoice PDF

  // Payments Endpoints
  static const String payments = "$server/payments";
  static const String paymentMethods = "$payments/methods";
  static const String processPayment = "$payments/process";
  static const String requestRefund = "$payments/refund";
  // Use "$payments/{id}/receipt" for getting receipt

  // File Management Endpoints
  static const String files = "$server/files";
  static const String uploadFile = "$files/upload";
  static const String deleteFile = "$files/delete";

  // Office Management Endpoints
  static const String officeManagement = "$server/office";
  static const String officeProfile = "$officeManagement/profile";
  static const String officeGallery = "$officeManagement/gallery";
  static const String officeDocuments = "$officeManagement/documents";
  static const String officeBookings = "$officeManagement/bookings";
  static const String officeBookingsStatistics = "$officeBookings/statistics";

  // Operator Management Endpoints
  static const String operatorManagement = "$server/operator";
  static const String operatorProfile = "$operatorManagement/profile";
  static const String operatorStatistics = "$operatorProfile/statistics";
  static const String operatorBuses = "$operatorManagement/buses";
  static const String operatorTripRequests =
      "$operatorManagement/trip-requests";
}
