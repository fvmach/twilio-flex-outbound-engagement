import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@twilio-paste/core/modal';
import { Button } from '@twilio-paste/core/button';
import { Checkbox } from '@twilio-paste/core/checkbox';
import { DataGrid, DataGridHead, DataGridRow, DataGridHeader, DataGridBody, DataGridCell } from '@twilio-paste/core/data-grid';
import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';
import { Input } from '@twilio-paste/core/input';
import { Select, Option } from '@twilio-paste/core/select';
import Papa from 'papaparse';

const fetchContactsFromAsset = async () => {
  try {
    const response = await fetch('https://flex-omnichannel-campaigns-3419.twil.io/fetch-contacts', {
      method: 'GET'
    });

    const data = await response.json();
    if (data.success) {
      const parsedData = Papa.parse(data.data, {
        header: true,
        skipEmptyLines: true,
      });
      return parsedData.data;
    } else {
      console.error('Failed to fetch contacts:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

const isValidContact = (contact) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(contact.phone) || contact.email;
};

const ContactModal = ({ isOpen, onClose, onContactsSelect }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactSource, setContactSource] = useState('manualInput');
  const [manualContact, setManualContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const loadContacts = async () => {
      if (contactSource === 'twilioAsset') {
        const fetchedContacts = await fetchContactsFromAsset();
        setContacts(fetchedContacts);
        setFilteredContacts(fetchedContacts);
      }
    };

    if (isOpen && contactSource === 'twilioAsset') {
      loadContacts();
    }
  }, [isOpen, contactSource]);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) =>
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, contacts]);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedContacts = result.data.filter(isValidContact);
          setContacts(parsedContacts);
          setFilteredContacts(parsedContacts);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  const handleContactSelect = (contactId) => {
    setSelectedContacts((prevSelectedContacts) =>
      prevSelectedContacts.includes(contactId)
        ? prevSelectedContacts.filter((id) => id !== contactId)
        : [...prevSelectedContacts, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.phone || contact.email));
    }
  };

  const handleSubmit = () => {
    if (contactSource === 'manualInput') {
      // Add manual contact to the selection
      onContactsSelect([manualContact]);
    } else {
      // Add selected contacts from data grid
      const selectedContactDetails = contacts.filter((contact) =>
        selectedContacts.includes(contact.phone || contact.email)
      );
      onContactsSelect(selectedContactDetails);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} ariaLabel="Contact Modal" size="wide">
      <ModalHeader>Select Contacts to Send Template</ModalHeader>
      <ModalBody>
        <Box marginBottom="space40">
          <Select
            id="contact-source"
            value={contactSource}
            onChange={(e) => setContactSource(e.target.value)}
          >
            <Option value="manualInput">Manual Input</Option>
            <Option value="twilioAsset">Twilio Asset</Option>
            <Option value="unifiedProfiles" disabled>Unified Profiles (coming soon)</Option>
            <Option value="csvUpload">CSV Upload</Option>
          </Select>
        </Box>

        {contactSource === 'manualInput' && (
          <Box marginBottom="space40">
            <Input
              id="first-name"
              placeholder="First Name"
              value={manualContact.firstName}
              onChange={(e) => setManualContact({ ...manualContact, firstName: e.target.value })}
            />
            <Input
              id="last-name"
              placeholder="Last Name"
              value={manualContact.lastName}
              onChange={(e) => setManualContact({ ...manualContact, lastName: e.target.value })}
              marginTop="space40"
            />
            <Input
              id="phone"
              placeholder="Phone (+123456789)"
              value={manualContact.phone}
              onChange={(e) => setManualContact({ ...manualContact, phone: e.target.value })}
              marginTop="space40"
            />
            <Input
              id="email"
              placeholder="Email"
              value={manualContact.email}
              onChange={(e) => setManualContact({ ...manualContact, email: e.target.value })}
              marginTop="space40"
            />
          </Box>
        )}

        {contactSource === 'unifiedProfiles' && (
          <Text as="p" fontSize="fontSize30" color="colorTextWeak">
            Unified Profiles integration is coming soon.
          </Text>
        )}

        {contactSource === 'csvUpload' && (
          <Box marginBottom="space40">
            <Input type="file" accept=".csv" onChange={handleCSVUpload} />
          </Box>
        )}

        {(contactSource === 'twilioAsset' || (contactSource === 'csvUpload' && contacts.length > 0)) && (
          <>
            <Box marginBottom="space40">
              <Input
                id="search"
                type="text"
                value={searchTerm}
                placeholder="Search contacts"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>

            {contacts.length > 0 ? (
              <>
                <Box marginBottom="space40">
                  <Button variant="secondary" onClick={handleSelectAll}>
                    {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
                <DataGrid aria-label="Contacts DataGrid">
                  <DataGridHead>
                    <DataGridRow>
                      <DataGridHeader>Select</DataGridHeader>
                      {Object.keys(contacts[0]).map((header, index) => (
                        <DataGridHeader key={index}>{header}</DataGridHeader>
                      ))}
                    </DataGridRow>
                  </DataGridHead>
                  <DataGridBody>
                    {filteredContacts.map((contact, index) => (
                      <DataGridRow key={index}>
                        <DataGridCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.phone || contact.email)}
                            onChange={() => handleContactSelect(contact.phone || contact.email)}
                          />
                        </DataGridCell>
                        {Object.values(contact).map((value, idx) => (
                          <DataGridCell key={idx}>{value}</DataGridCell>
                        ))}
                      </DataGridRow>
                    ))}
                  </DataGridBody>
                </DataGrid>
              </>
            ) : (
              <Text>No contacts available.</Text>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleSubmit}>
          Confirm Selection
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ContactModal;
