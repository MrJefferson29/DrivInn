import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListingsProvider } from './context/ListingsContext';
import { FiltersProvider } from './context/FiltersContext';
import NavbarComponent from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import SocialLoginSuccess from './components/auth/SocialLoginSuccess';
import CreateListing from './components/CreateListing';
import BecomeAHostInfo from './components/BecomeAHostInfo';
import ListingDetails from './components/ListingDetails';
import Profile from './components/user/Profile';
import EditProfile from './components/user/EditProfile';
import EditListing from './components/EditListing';
import HostApplicationForm from './components/HostApplicationForm';
import HostApplicationStatus from './components/HostApplicationStatus';
import AdminHostApplicationsPanel from './components/AdminHostApplicationsPanel';
import UserNotifications from './components/UserNotifications';
import NotificationDetails from './components/NotificationDetails';
import AdminPaymentsDashboard from './components/AdminPaymentsDashboard';
import MoreLikeThis from './components/MoreLikeThis';
import LikedListings from './components/LikedListings';
import MyListings from './components/MyListings';
import UserBookings from './components/UserBookings';
import ChatRoomsList from './components/ChatRoomsList';
import ChatScreen from './components/ChatScreen';
import BookingSuccess from './components/BookingSuccess';
import BookingCancel from './components/BookingCancel';
import TestBookingStatus from './components/TestBookingStatus';

function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <FiltersProvider>
      <Router>
        <NavbarComponent />
        <BottomNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/social-login-success" element={<SocialLoginSuccess />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/become-a-host-info" element={<BecomeAHostInfo />} />
          <Route path="/become-a-host/apply" element={<HostApplicationForm />} />
          <Route path="/become-a-host/status" element={<HostApplicationStatus />} />
          <Route path="/admin/host-applications" element={<AdminHostApplicationsPanel />} />
          <Route path="/admin/payments" element={<AdminPaymentsDashboard />} />
          <Route path="/notifications" element={<UserNotifications />} />
          <Route path="/notification/:id" element={<NotificationDetails />} />
          <Route path="/more-like-this/:category" element={<MoreLikeThis />} />
          <Route path="/liked-listings" element={<LikedListings />} />
          <Route path="/listings" element={<MyListings />} />
          <Route path="/bookings" element={<UserBookings />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/booking-cancel" element={<BookingCancel />} />
          <Route path="/test-booking-status" element={<TestBookingStatus />} />
          <Route path="/messages" element={<ChatRoomsList />} />
          <Route path="/messages/:roomId" element={<ChatScreen />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
        </Routes>
      </Router>
        </FiltersProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}

export default App;