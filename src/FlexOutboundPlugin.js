import React from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';
import { Theme } from '@twilio-paste/core/theme';
import { Button, Box } from '@twilio-paste/core';
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import { ProductMessagingIcon } from '@twilio-paste/icons/esm/ProductMessagingIcon';
import { Actions } from '@twilio/flex-ui';
import {
  SideModal,
  SideModalBody,
  SideModalButton,
  SideModalContainer,
  SideModalHeader,
  SideModalHeading,
  useSideModalState,
} from '@twilio-paste/core/side-modal';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalHeader,
  ModalHeading,
} from '@twilio-paste/core/modal';
import { useUID } from '@twilio-paste/core/uid-library';

import CampaignMode from './components/CampaignMode/CampaignMode';
import AgentTemplatePanel from './components/AgentTemplatePanel/AgentTemplatePanel';
import StartConversation from './components/StartConversation/StartConversation';

const PLUGIN_NAME = 'FlexOutboundPlugin';

export default class FlexOutboundPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    // Add Campaign Mode button to MainHeader (next to dialpad)
    flex.MainHeader.Content.add(
      <Theme.Provider theme="default" key="campaign-mode-button-provider">
        <CampaignModeButton manager={manager} />
      </Theme.Provider>,
      {
        sortOrder: 1,
        align: 'end',
      }
    );

    // Add Start Conversation to NoTasksCanvas (only shows when no active tasks)
    flex.NoTasksCanvas.Content.replace(
      <Theme.Provider theme="default" key="start-conversation-provider">
        <StartConversation manager={manager} />
      </Theme.Provider>,
      {
        sortOrder: 1,
      }
    );

    // Add Agent Template Panel to MessageInputActions
    flex.MessageInputActions.Content.add(
      <Theme.Provider theme="default" key="agent-template-panel-provider">
        <AgentTemplatePanelButton manager={manager} />
      </Theme.Provider>,
      {
        sortOrder: 1,
      }
    );
  }
}


const CampaignModeButton = ({ manager }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const modalHeadingID = useUID();

  return (
    <Box paddingRight="space60">
      <Button
        variant="primary"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        <ProductMessagingIcon decorative />
        Start Campaign
      </Button>

      <Modal
        ariaLabelledby={modalHeadingID}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        size="wide"
      >
        <ModalHeader>
          <ModalHeading as="h3" id={modalHeadingID}>
            Outbound Campaign Mode
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <CampaignMode manager={manager} />
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </Box>
  );
};

const AgentTemplatePanelButton = ({ manager }) => {
  const dialog = useSideModalState({});

  return (
    <Box>
      <SideModalContainer state={dialog}>
        <SideModalButton variant="primary" size="small">
          Templates
        </SideModalButton>

        <SideModal aria-label="Template Selection" size="default">
          <SideModalHeader>
            <SideModalHeading as="h3">Select Template</SideModalHeading>
          </SideModalHeader>
          <SideModalBody>
            <AgentTemplatePanel manager={manager} />
          </SideModalBody>
        </SideModal>
      </SideModalContainer>
    </Box>
  );
};

