import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  Forum as ForumIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const faqs = [
  {
    question: 'How do I create a new report?',
    answer: 'To create a new report, navigate to the Reports section and click on the "Generate Report" button. Follow the on-screen instructions to select the type of report and customize the parameters.'
  },
  {
    question: 'How can I manage user permissions?',
    answer: 'User permissions can be managed by administrators in the Users section. Click on a user to edit their permissions and access levels.'
  },
  {
    question: 'What should I do if I forget my password?',
    answer: 'On the login page, click on the "Forgot Password" link and follow the instructions to reset your password. A reset link will be sent to your registered email address.'
  },
  {
    question: 'How do I export data from the system?',
    answer: 'You can export data in various formats (CSV, Excel, PDF) from most data tables by clicking the export button in the top-right corner of the table.'
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'Yes, OptiSaha is available as a progressive web app (PWA) that works on mobile devices. You can install it from your browser when accessing the application on a mobile device.'
  },
];

const SupportPage = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit the support request to a backend
    console.log('Support request submitted:', message);
    setSubmitted(true);
    setMessage('');
    
    // Reset the submitted state after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Help & Support
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="h6">Email Support</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Send us an email and we'll get back to you within 24 hours.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<EmailIcon />}
                href="mailto:support@optisaha.com"
                fullWidth
              >
                Email Us
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="h6">Phone Support</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Call us for immediate assistance during business hours.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<PhoneIcon />}
                href="tel:+901234567890"
                fullWidth
              >
                +90 (123) 456 7890
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ChatIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="h6">Live Chat</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Chat with our support team in real-time.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ChatIcon />}
                fullWidth
                onClick={() => alert('Live chat service will be available soon.')}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HelpIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Frequently Asked Questions
              </Typography>
              
              {faqs.map((faq, index) => (
                <Accordion 
                  key={index} 
                  expanded={expanded === `panel${index}`} 
                  onChange={handleChange(`panel${index}`)}
                  sx={{ 
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 1,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}bh-content`}
                    id={`panel${index}bh-header`}
                    sx={{ 
                      backgroundColor: expanded === `panel${index}` 
                        ? theme.palette.action.selected 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ArticleIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Documentation & Resources
              </Typography>
              
              <List disablePadding>
                <ListItem 
                  button 
                  component="a" 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Documentation will open in a new tab.');
                  }}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon><ArticleIcon /></ListItemIcon>
                  <ListItemText 
                    primary="User Guide" 
                    secondary="Complete guide to using OptiSaha" 
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  component="a" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Video tutorials will open in a new tab.');
                  }}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon><VideoLibraryIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Video Tutorials" 
                    secondary="Step-by-step video guides" 
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  component="a" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Community forum will open in a new tab.');
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon><ForumIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Community Forum" 
                    secondary="Connect with other users" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SendIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Send Us a Message
              </Typography>
              
              {submitted ? (
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.success.light, 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography>Your message has been sent. We'll get back to you soon!</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" paragraph>
                  Can't find what you're looking for? Send us a message and our support team will help you.
                </Typography>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Your Email"
                  variant="outlined"
                  required
                  type="email"
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Subject"
                  variant="outlined"
                  required
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="How can we help you?"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    startIcon={<SendIcon />}
                    disabled={submitted}
                  >
                    {submitted ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Popular Topics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Billing', 'Account', 'API', 'Mobile App', 'Data Export', 'User Management'].map((topic) => (
                    <Chip 
                      key={topic} 
                      label={topic} 
                      variant="outlined" 
                      onClick={() => setMessage(`I need help with ${topic.toLowerCase()}.`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportPage;
