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

  return (
    <Box>
      {/* Button to open the Side Modal */}
      <SideModalContainer state={dialog}>
        <SideModalButton variant="secondary_icon" size="icon_small">
          {/* Icon button to open the dialog */}
          <Button variant="secondary" size="small">Open Outbound Messaging</Button>
        </SideModalButton>

        {/* The actual Side Modal */}
        <SideModal aria-label="Outbound Messaging Modal" size="wide">
          <SideModalHeader>
            <SideModalHeading>Send Messages or Start Calls</SideModalHeading>
          </SideModalHeader>
          <SideModalBody>
            {/* OutboundMessaging Component inside the Modal */}
            <OutboundMessaging />
          </SideModalBody>
        </SideModal>
      </SideModalContainer>
    </Box>
  );
};
