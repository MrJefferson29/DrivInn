import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, Accordion, Row, Col } from 'react-bootstrap';
import { 
  FaHome, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaQuestionCircle, 
  FaArrowRight, 
  FaUserFriends, 
  FaCalendarAlt, 
  FaShieldAlt, 
  FaStar, 
  FaPlusCircle, 
  FaAward, 
  FaUserCircle, 
  FaGlobe, 
  FaLock,
  FaIdCard,
  FaCamera,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaFileAlt,
  FaClock,
  FaUserCheck,
  FaMapMarkerAlt,
  FaTools,
  FaHeadset
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;
const floatAnim = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Hero = styled.section`
  width: 100vw;
  min-height: 420px;
  background: linear-gradient(120deg, rgba(37,99,235,0.82) 0%, rgba(245,158,66,0.62) 100%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&h=800&fit=crop') center/cover;
  color: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 90px 16px 60px 16px;
  position: relative;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  animation: ${fadeIn} 1.1s cubic-bezier(.4,1.6,.6,1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-height: 360px;
    padding: 70px 16px 40px 16px;
  }
  
  @media (max-width: 480px) {
    min-height: 320px;
    padding: 60px 12px 30px 12px;
  }
`;

const AnimatedOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, transparent 70%),
    radial-gradient(circle at 30% 70%, rgba(255,255,255,0.10) 0%, transparent 80%);
  animation: ${floatAnim} 8s ease-in-out infinite;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  margin-bottom: 18px;
  text-shadow: 0 2px 16px rgba(0,0,0,0.18);
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.45rem;
  font-weight: 400;
  margin-bottom: 36px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.12);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 24px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 32px;
  background: linear-gradient(90deg, rgba(255,56,92,0.08) 0%, rgba(255,180,0,0.08) 100%);
  margin: 0 auto 0 auto;
`;

const StepperWrap = styled.div`
  max-width: 900px;
  margin: -60px auto 40px auto;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 32px 24px 18px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1.2s 0.2s both;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin: -40px auto 30px auto;
    padding: 24px 16px 16px 16px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    margin: -30px auto 20px auto;
    padding: 20px 12px 12px 12px;
    border-radius: 12px;
  }
`;

const StepperTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
`;

const Steps = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 20px;
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 140px;
  }
  
  @media (max-width: 480px) {
    width: 120px;
  }
`;

const StepIcon = styled.div`
  background: #FF385C;
  color: #fff;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(255,56,92,0.10);
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    font-size: 1.6rem;
  }
`;

const StepLabel = styled.div`
  font-size: 1.08rem;
  font-weight: 600;
  color: #222;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Section = styled.section`
  max-width: 1100px;
  margin: 0 auto 48px auto;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    margin: 0 auto 36px auto;
    padding: 0 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 auto 24px auto;
    padding: 0 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #FF385C, #ff6b6b);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.7rem;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    gap: 24px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 20px;
    margin-bottom: 20px;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 32px 28px 28px 28px;
  min-width: 260px;
  max-width: 340px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: ${fadeIn} 1.2s both;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(255,56,92,0.13);
    transform: translateY(-4px) scale(1.04);
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px 20px 20px;
    min-width: 240px;
    max-width: 320px;
    flex: 1 1 240px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 16px 16px 16px;
    min-width: 220px;
    max-width: 300px;
    flex: 1 1 220px;
    border-radius: 12px;
  }
`;

const CardIcon = styled.div`
  font-size: 2.2rem;
  color: #FF385C;
  margin-bottom: 14px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #222;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
`;

const CardText = styled.p`
  font-size: 1.08rem;
  color: #444;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

// Verification Process Section
const VerificationSection = styled(Section)`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  padding: 40px 24px;
  margin: 48px auto;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    margin: 36px auto;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
    margin: 24px auto;
    border-radius: 12px;
  }
`;

const VerificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    margin-top: 20px;
  }
`;

const VerificationStep = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-left: 4px solid #FF385C;
  animation: ${slideInLeft} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const VerificationStepTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 8px;
  }
`;

const VerificationStepContent = styled.div`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const VerificationRequirements = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  margin-top: 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  animation: ${slideInRight} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 24px;
    margin-top: 24px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    margin-top: 20px;
    border-radius: 10px;
  }
`;

const RequirementsTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
`;

const RequirementsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    gap: 8px;
  }
`;

const RequirementIcon = styled.div`
  color: #28a745;
  font-size: 1.2rem;
  margin-top: 2px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const RequirementText = styled.div`
  color: #444;
  font-size: 1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// Testimonial Carousel
const CarouselWrap = styled.div`
  max-width: 900px;
  margin: 0 auto 48px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    margin: 0 auto 36px auto;
    padding: 0 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 auto 24px auto;
    padding: 0 8px;
  }
`;

const CarouselTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 14px;
  }
`;

const CarouselInner = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const TestimonialCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 28px 24px 22px 24px;
  min-width: 260px;
  max-width: 340px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${fadeIn} 1.2s both;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(255,56,92,0.13);
    transform: translateY(-2px) scale(1.03);
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px 18px 20px;
    min-width: 240px;
    max-width: 320px;
    flex: 1 1 240px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 16px 14px 16px;
    min-width: 220px;
    max-width: 300px;
    flex: 1 1 220px;
  }
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffe1e7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  margin-bottom: 10px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    font-size: 1.8rem;
  }
`;

const Quote = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 10px;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Name = styled.div`
  font-weight: 600;
  color: #FF385C;
  font-size: 1.05rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const CarouselNav = styled.button`
  background: #fff;
  border: 1.5px solid #FF385C;
  color: #FF385C;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 8px;
  transition: background 0.18s, color 0.18s;
  
  &:hover, &:focus {
    background: #FF385C;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
`;

const CostSection = styled(Section)`
  background: #fff7f7;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,56,92,0.06);
  padding: 40px 24px 32px 24px;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    padding: 32px 16px 24px 16px;
    margin-bottom: 36px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px 20px 12px;
    margin-bottom: 24px;
    border-radius: 12px;
  }
`;

const CostTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 14px;
  }
`;

const CostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
`;

const CostItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.08rem;
  color: #23272f;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    gap: 8px;
  }
`;

const FaqSection = styled(Section)`
  background: #f8f9fa;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 40px 24px 32px 24px;
  
  @media (max-width: 768px) {
    padding: 32px 16px 24px 16px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px 20px 12px;
    border-radius: 12px;
  }
`;

const FaqTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
`;

const TrustBar = styled.div`
  width: 100vw;
  background: #fff;
  box-shadow: 0 -1px 8px rgba(0,0,0,0.04);
  padding: 10px 0 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  font-size: 1.1rem;
  color: #FF385C;
  font-weight: 600;
  margin-bottom: 0;
  z-index: 101;
  
  @media (max-width: 768px) {
    gap: 24px;
    font-size: 1rem;
    padding: 8px 0 4px 0;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    font-size: 0.9rem;
    padding: 6px 0 2px 0;
    flex-wrap: wrap;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: #FF385C;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    gap: 4px;
  }
`;

const StickyCTA = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.08);
  padding: 18px 0 14px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  
  @media (max-width: 700px) {
    padding: 12px 0 10px 0;
  }
  
  @media (max-width: 480px) {
    padding: 10px 0 8px 0;
  }
`;

const BecomeAHostInfo = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('0');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const testimonials = [
    {
      name: 'Sarah M.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      quote: 'Hosting on DrivInn has allowed me to meet amazing people and earn extra income. The support and protection are top-notch!'
    },
    {
      name: 'James L.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      quote: 'I love the flexibility. I can host when I want and block dates when I need my space. The process is easy and transparent.'
    },
    {
      name: 'Priya S.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'The payout system is fast and secure. I feel safe knowing DrivInn has my back as a host.'
    }
  ];
  const handlePrev = () => setCarouselIdx((carouselIdx - 1 + testimonials.length) % testimonials.length);
  const handleNext = () => setCarouselIdx((carouselIdx + 1) % testimonials.length);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 120 }}>
      <Hero>
        <AnimatedOverlay />
        <HeroContent>
          <HeroTitle>Become a Host</HeroTitle>
          <HeroSubtitle>Share your world, earn extra income, and join a global community of hosts.</HeroSubtitle>
        </HeroContent>
      </Hero>
      <Divider />
      <StepperWrap>
        <StepperTitle>How it works</StepperTitle>
        <Steps>
          <Step>
            <StepIcon><FaPlusCircle /></StepIcon>
            <StepLabel>Create your listing</StepLabel>
          </Step>
          <Step>
            <StepIcon><FaCalendarAlt /></StepIcon>
            <StepLabel>Set your availability</StepLabel>
          </Step>
          <Step>
            <StepIcon><FaUserFriends /></StepIcon>
            <StepLabel>Welcome guests</StepLabel>
          </Step>
          <Step>
            <StepIcon><FaMoneyBillWave /></StepIcon>
            <StepLabel>Get paid</StepLabel>
          </Step>
        </Steps>
      </StepperWrap>
      
      <Section>
        <SectionTitle>Why Host with Us?</SectionTitle>
        <Cards>
          <Card>
            <CardIcon><FaHome /></CardIcon>
            <CardTitle>Share your space or car</CardTitle>
            <CardText>List a home, apartment, or car. You're in control of your availability, prices, and house rules.</CardText>
          </Card>
          <Card>
            <CardIcon><FaStar /></CardIcon>
            <CardTitle>Earn and grow</CardTitle>
            <CardText>Earn extra income, meet people from around the world, and make the most of your space. Get reviews and become a Superhost.</CardText>
          </Card>
          <Card>
            <CardIcon><FaShieldAlt /></CardIcon>
            <CardTitle>Support & protection</CardTitle>
            <CardText>DrivInn provides 24/7 support, insurance, and a trusted platform to help you succeed as a host.</CardText>
          </Card>
        </Cards>
      </Section>

      {/* Verification Process Section */}
      <VerificationSection>
        <SectionTitle>Verification Process</SectionTitle>
        <VerificationGrid>
          <VerificationStep>
            <VerificationStepTitle>
              <FaIdCard style={{ color: '#FF385C' }} />
              Identity Verification
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Government ID:</strong> Upload a valid government-issued photo ID (passport, driver's license, or national ID card).</p>
              <p><strong>Selfie Verification:</strong> Take a clear photo of yourself to match with your ID.</p>
              <p><strong>Processing Time:</strong> Usually completed within 24-48 hours.</p>
            </VerificationStepContent>
          </VerificationStep>
          
          <VerificationStep>
            <VerificationStepTitle>
              <FaPhone style={{ color: '#FF385C' }} />
              Phone & Email Verification
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Phone Number:</strong> Verify your phone number with a one-time code sent via SMS.</p>
              <p><strong>Email Address:</strong> Confirm your email address to receive important updates and notifications.</p>
              <p><strong>Two-Factor Authentication:</strong> Optional but recommended for enhanced security.</p>
            </VerificationStepContent>
          </VerificationStep>
          
          <VerificationStep>
            <VerificationStepTitle>
              <FaCreditCard style={{ color: '#FF385C' }} />
              Payment Method Verification
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Bank Account:</strong> Add and verify your bank account for secure payouts.</p>
              <p><strong>Payment Processing:</strong> Complete a small test transaction to verify your payment method.</p>
              <p><strong>Payout Schedule:</strong> Set up your preferred payout frequency (daily, weekly, or monthly).</p>
            </VerificationStepContent>
          </VerificationStep>
          
          <VerificationStep>
            <VerificationStepTitle>
              <FaCamera style={{ color: '#FF385C' }} />
              Property Documentation
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Property Photos:</strong> Upload high-quality photos of your space or vehicle.</p>
              <p><strong>Property Details:</strong> Provide accurate information about amenities, location, and availability.</p>
              <p><strong>Safety Features:</strong> Document safety measures and emergency contact information.</p>
            </VerificationStepContent>
          </VerificationStep>
          
          <VerificationStep>
            <VerificationStepTitle>
              <FaFileAlt style={{ color: '#FF385C' }} />
              Background Check
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Criminal Record:</strong> Optional background check for enhanced trust and safety.</p>
              <p><strong>Reference Checks:</strong> Provide references from previous hosting or rental experiences.</p>
              <p><strong>Community Standards:</strong> Review and agree to our community guidelines and hosting standards.</p>
            </VerificationStepContent>
          </VerificationStep>
          
          <VerificationStep>
            <VerificationStepTitle>
              <FaUserCheck style={{ color: '#FF385C' }} />
              Final Review
            </VerificationStepTitle>
            <VerificationStepContent>
              <p><strong>Application Review:</strong> Our team reviews your complete application within 3-5 business days.</p>
              <p><strong>Approval Notification:</strong> Receive email confirmation once your account is approved.</p>
              <p><strong>Welcome Kit:</strong> Access to our host resources, support channels, and welcome materials.</p>
            </VerificationStepContent>
          </VerificationStep>
        </VerificationGrid>
        
        <VerificationRequirements>
          <RequirementsTitle>Verification Requirements</RequirementsTitle>
          <RequirementsList>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Valid government-issued photo ID</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Verified phone number and email address</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Active bank account for payouts</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>High-quality property photos (minimum 5)</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Accurate property description and amenities</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Agreement to community guidelines and terms</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Emergency contact information</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementIcon><FaCheckCircle /></RequirementIcon>
              <RequirementText>Proof of property ownership or rental agreement</RequirementText>
            </RequirementItem>
          </RequirementsList>
        </VerificationRequirements>
      </VerificationSection>

      <CarouselWrap>
        <CarouselTitle>What our hosts say</CarouselTitle>
        <CarouselInner>
          <CarouselNav aria-label="Previous testimonial" onClick={handlePrev}>&lt;</CarouselNav>
          <TestimonialCard>
            <Avatar>{testimonials[carouselIdx].avatar ? <img src={testimonials[carouselIdx].avatar} alt={testimonials[carouselIdx].name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <FaUserCircle />}</Avatar>
            <Quote>"{testimonials[carouselIdx].quote}"</Quote>
            <Name>{testimonials[carouselIdx].name}</Name>
          </TestimonialCard>
          <CarouselNav aria-label="Next testimonial" onClick={handleNext}>&gt;</CarouselNav>
        </CarouselInner>
      </CarouselWrap>
      
      <Divider />
      <CostSection>
        <CostTitle>What does it cost?</CostTitle>
        <CostList>
          <CostItem><FaCheckCircle style={{ color: '#27ae60' }} /> Listing is free—no upfront costs or subscriptions</CostItem>
          <CostItem><FaCheckCircle style={{ color: '#27ae60' }} /> Only pay a 3% service fee per booking</CostItem>
          <CostItem><FaCheckCircle style={{ color: '#27ae60' }} /> Secure payments and easy payouts</CostItem>
        </CostList>
        <Button variant="outline-danger" size="md" style={{ borderRadius: 24, fontWeight: 600 }} onClick={() => navigate('/create-listing')}>
          See your earning potential <FaArrowRight style={{ marginLeft: 8 }} />
        </Button>
      </CostSection>
      
      <Divider />
      <FaqSection>
        <FaqTitle>Frequently Asked Questions</FaqTitle>
        <Accordion activeKey={activeKey} onSelect={setActiveKey} flush>
          <Accordion.Item eventKey="0">
            <Accordion.Header>How do I get started?</Accordion.Header>
            <Accordion.Body>
              Click <b>Start Hosting</b> below and follow the steps to create your listing. You can list a home, apartment, or car. The verification process typically takes 3-5 business days.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>What are the verification requirements?</Accordion.Header>
            <Accordion.Body>
              You must provide a valid government ID, verify your phone and email, add a bank account for payouts, upload property photos, and agree to our community guidelines. Background checks are optional but recommended.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>How long does verification take?</Accordion.Header>
            <Accordion.Body>
              Identity verification is usually completed within 24-48 hours. The complete application review takes 3-5 business days. You'll receive email notifications at each step.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>How do I get paid?</Accordion.Header>
            <Accordion.Body>
              DrivInn releases your payout 24 hours after a guest checks in. Payments are sent via your selected payout method. You can choose daily, weekly, or monthly payouts.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>Can I host part-time?</Accordion.Header>
            <Accordion.Body>
              Yes! You control your calendar and availability. Host as much or as little as you want. You can block dates when you need your space.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5">
            <Accordion.Header>What support is available?</Accordion.Header>
            <Accordion.Body>
              We provide 24/7 support, insurance coverage, host resources, and a community forum. You can contact us via phone, email, or live chat for assistance.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </FaqSection>
      
      <TrustBar>
        <TrustItem><FaAward /> 4.8/5 Host Rating</TrustItem>
        <TrustItem><FaGlobe /> 220+ Countries</TrustItem>
        <TrustItem><FaLock /> Secure Payments</TrustItem>
        <TrustItem><FaHeadset /> 24/7 Support</TrustItem>
      </TrustBar>
      
      <StickyCTA>
        <Button size="lg" variant="danger" style={{ borderRadius: 32, fontWeight: 700, fontSize: '1.2rem', padding: '12px 36px', boxShadow: '0 2px 12px rgba(255,56,92,0.13)' }} onClick={() => navigate('/become-a-host/apply')}>
          <FaHome style={{ marginRight: 10 }} /> Apply Now
        </Button>
      </StickyCTA>
    </div>
  );
};

export default BecomeAHostInfo; 