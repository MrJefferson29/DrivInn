import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, Accordion } from 'react-bootstrap';
import { FaHome, FaMoneyBillWave, FaCheckCircle, FaQuestionCircle, FaArrowRight, FaUserFriends, FaCalendarAlt, FaShieldAlt, FaStar, FaPlusCircle, FaAward, FaUserCircle, FaGlobe, FaLock } from 'react-icons/fa';
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
`;

const HeroSubtitle = styled.p`
  font-size: 1.45rem;
  font-weight: 400;
  margin-bottom: 36px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.12);
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
`;

const StepperTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
`;

const Steps = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 10px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  text-align: center;
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
`;

const StepLabel = styled.div`
  font-size: 1.08rem;
  font-weight: 600;
  color: #222;
`;

const Section = styled.section`
  max-width: 1100px;
  margin: 0 auto 48px auto;
  padding: 0 16px;
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 32px;
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
`;

const CardIcon = styled.div`
  font-size: 2.2rem;
  color: #FF385C;
  margin-bottom: 14px;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #222;
`;

const CardText = styled.p`
  font-size: 1.08rem;
  color: #444;
`;

// Testimonial Carousel
const CarouselWrap = styled.div`
  max-width: 900px;
  margin: 0 auto 48px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const CarouselTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
`;
const CarouselInner = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: center;
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
`;
const Quote = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 10px;
  font-style: italic;
`;
const Name = styled.div`
  font-weight: 600;
  color: #FF385C;
  font-size: 1.05rem;
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
`;

const CostSection = styled(Section)`
  background: #fff7f7;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,56,92,0.06);
  padding: 40px 24px 32px 24px;
  margin-bottom: 48px;
`;

const CostTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
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
`;

const FaqSection = styled(Section)`
  background: #f8f9fa;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 40px 24px 32px 24px;
`;

const FaqTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 18px;
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
`;
const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: #FF385C;
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
`;

const BecomeAHostInfo = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('0');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const testimonials = [
    {
      name: 'Sarah M.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      quote: 'Hosting on Airbnb has allowed me to meet amazing people and earn extra income. The support and protection are top-notch!'
    },
    {
      name: 'James L.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      quote: 'I love the flexibility. I can host when I want and block dates when I need my space. The process is easy and transparent.'
    },
    {
      name: 'Priya S.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'The payout system is fast and secure. I feel safe knowing Airbnb has my back as a host.'
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
        <Cards>
          <Card>
            <CardIcon><FaHome /></CardIcon>
            <CardTitle>Share your space or car</CardTitle>
            <CardText>List a home, apartment, or car. You’re in control of your availability, prices, and house rules.</CardText>
          </Card>
          <Card>
            <CardIcon><FaStar /></CardIcon>
            <CardTitle>Earn and grow</CardTitle>
            <CardText>Earn extra income, meet people from around the world, and make the most of your space. Get reviews and become a Superhost.</CardText>
          </Card>
          <Card>
            <CardIcon><FaShieldAlt /></CardIcon>
            <CardTitle>Support & protection</CardTitle>
            <CardText>Airbnb provides 24/7 support, insurance, and a trusted platform to help you succeed as a host.</CardText>
          </Card>
        </Cards>
      </Section>
      <CarouselWrap>
        <CarouselTitle>What our hosts say</CarouselTitle>
        <CarouselInner>
          <CarouselNav aria-label="Previous testimonial" onClick={handlePrev}>&lt;</CarouselNav>
          <TestimonialCard>
            <Avatar>{testimonials[carouselIdx].avatar ? <img src={testimonials[carouselIdx].avatar} alt={testimonials[carouselIdx].name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <FaUserCircle />}</Avatar>
            <Quote>“{testimonials[carouselIdx].quote}”</Quote>
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
              Click <b>Start Hosting</b> below and follow the steps to create your listing. You can list a home, apartment, or car.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>What are the requirements?</Accordion.Header>
            <Accordion.Body>
              You must provide accurate information, photos, and comply with local laws. Airbnb may require ID verification for hosts and guests.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>How do I get paid?</Accordion.Header>
            <Accordion.Body>
              Airbnb releases your payout 24 hours after a guest checks in. Payments are sent via your selected payout method.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>Can I host part-time?</Accordion.Header>
            <Accordion.Body>
              Yes! You control your calendar and availability. Host as much or as little as you want.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </FaqSection>
      <TrustBar>
        <TrustItem><FaAward /> 4.8/5 Host Rating</TrustItem>
        <TrustItem><FaGlobe /> 220+ Countries</TrustItem>
        <TrustItem><FaLock /> Secure Payments</TrustItem>
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