import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, IconButton, Typography, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import i18n from '../i18n/i18n';

const LanguageSelector = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [currentLanguage, setCurrentLanguage] = React.useState(i18n.language);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      setCurrentLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      handleClose();
    });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        color="inherit"
        aria-label="language"
        aria-controls="language-menu"
        aria-haspopup="true"
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage('en')} 
          selected={currentLanguage === 'en'}
        >
          <Box display="flex" alignItems="center">
            <span role="img" aria-label="English" style={{ marginRight: 8 }}>🇬🇧</span>
            <Typography>{t('common.english')}</Typography>
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('tr')} 
          selected={currentLanguage === 'tr'}
        >
          <Box display="flex" alignItems="center">
            <span role="img" aria-label="Türkçe" style={{ marginRight: 8 }}>🇹🇷</span>
            <Typography>{t('common.turkish')}</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;
