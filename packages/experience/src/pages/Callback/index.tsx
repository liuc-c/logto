import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import LoadingLayer from '@/shared/components/LoadingLayer';

import useSocialCallbackHandler from './use-social-callback-handler';

type Parameters = {
  connectorId: string;
};

/**
 * Callback landing page for social sign-in and single sign-on.
 */
const Callback = () => {
  const { connectorId } = useParams<Parameters>();

  const { socialCallbackHandler } = useSocialCallbackHandler();

  // SocialSignIn Callback Handler
  useEffect(() => {
    if (!connectorId) {
      return;
    }
    socialCallbackHandler(connectorId);
  }, [socialCallbackHandler, connectorId]);

  if (!connectorId) {
    return null;
  }

  return <LoadingLayer />;
};

export default Callback;
