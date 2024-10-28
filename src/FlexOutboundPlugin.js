import React, { useState } from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';
import { Theme } from '@twilio-paste/core/theme';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import {
  SideModal,
  SideModalBody,
  SideModalButton,
  SideModalContainer,
  SideModalHeader,
  SideModalHeading,
  useSideModalState,
} from '@twilio-paste/core/side-modal';
import OutboundMessaging from './components/OutboundMessaging/OutboundMessaging'; // Your custom component

const PLUGIN_NAME = 'FlexOutboundPlugin';

export default class FlexOutboundPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    // Add a new button to the Main Header to open the Side Modal
    flex.MainHeader.Content.add(
      <Theme.Provider theme="default" key="side-modal-button-theme-provider">
        <SideModalExample />
      </Theme.Provider>,
      {
        sortOrder: -1, // Ensures it is placed at the left
        align: 'end',
      }
    );
  }
}

// Side Modal Component
const SideModalExample = () => {
  const dialog = useSideModalState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <Box>
      {/* Button to open the Side Modal */}
      <SideModalContainer state={dialog}>
        <SideModalButton variant="secondary_icon" size="icon_small">
          <Button variant="secondary" size="small">Open Outbound Messaging</Button>
        </SideModalButton>

        {/* Side Modal with optional full-screen overlay */}
        {!isFullScreen ? (
          <SideModal aria-label="Outbound Messaging Modal" size="wide">
            <SideModalHeader>
              <SideModalHeading>Send Messages or Start Calls</SideModalHeading>
              {/* Button to expand to full screen */}
              <Button variant="link" size="small" onClick={toggleFullScreen} style={{ marginLeft: 'auto' }}>
                Expand to Full Screen
              </Button>
            </SideModalHeader>
            <SideModalBody>
              <OutboundMessaging />
            </SideModalBody>
          </SideModal>
        ) : (
          <Box
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'white',
              zIndex: 50,
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <SideModalHeading as="h2">Send Messages or Start Calls</SideModalHeading>
              <Button variant="secondary" size="small" onClick={toggleFullScreen}>
                Exit Full Screen
              </Button>
            </Box>
            <OutboundMessaging style={{zIndex: 2000}}/>
          </Box>
        )}
      </SideModalContainer>
    </Box>
  );
};
