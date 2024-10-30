import React, { useState, useEffect } from 'react';
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
import OutboundMessaging from './components/OutboundMessaging/OutboundMessaging';

const PLUGIN_NAME = 'FlexOutboundPlugin';

export default class FlexOutboundPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    flex.MainHeader.Content.add(
      <Theme.Provider theme="default" key="side-modal-button-theme-provider">
        <SideModalExample />
      </Theme.Provider>,
      {
        sortOrder: -1,
        align: 'end',
      }
    );
  }
}

const SideModalExample = () => {
  const dialog = useSideModalState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  // State for OutboundMessaging
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [templateVariables, setTemplateVariables] = useState({});
  const [manualContentSid, setManualContentSid] = useState("");

  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  return (
    <Box>
      <SideModalContainer state={dialog}>
        <SideModalButton variant="secondary_icon" size="icon_small">
          <Button variant="secondary" size="small">Open Outbound Messaging</Button>
        </SideModalButton>

        {!isFullScreen ? (
          <SideModal aria-label="Outbound Messaging Modal" size="wide">
            <SideModalHeader>
              <SideModalHeading>Send Messages or Start Calls</SideModalHeading>
              <Button variant="link" size="small" onClick={toggleFullScreen} style={{ marginLeft: 'auto' }}>
                Expand to Full Screen
              </Button>
            </SideModalHeader>
            <SideModalBody>
              <OutboundMessaging
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                templateVariables={templateVariables}
                setTemplateVariables={setTemplateVariables}
                manualContentSid={manualContentSid}
                setManualContentSid={setManualContentSid}
              />
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
            <OutboundMessaging
              selectedContacts={selectedContacts}
              setSelectedContacts={setSelectedContacts}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
              templateVariables={templateVariables}
              setTemplateVariables={setTemplateVariables}
              manualContentSid={manualContentSid}
              setManualContentSid={setManualContentSid}
              style={{ zIndex: 2000 }}
            />
          </Box>
        )}
      </SideModalContainer>
    </Box>
  );
};
