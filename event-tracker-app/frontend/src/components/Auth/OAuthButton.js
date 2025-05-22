import React from 'react';
import { OAUTH_PROVIDERS } from '../../utils/constants';

const OAuthButton = ({ provider }) => {
  const providerConfig = OAUTH_PROVIDERS[provider];
  
  if (!providerConfig) {
    return null;
  }

  const handleOAuthLogin = () => {
    window.location.href = `/api/auth/oauth`;
  };

  return (
    <button 
      onClick={handleOAuthLogin}
      className={`btn btn-oauth ${provider}`}
    >
      <i className={providerConfig.icon}></i>
      Continue with {providerConfig.name}
    </button>
  );
};

export default OAuthButton;
