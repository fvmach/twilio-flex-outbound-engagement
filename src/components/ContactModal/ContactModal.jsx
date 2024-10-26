import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@twilio-paste/core/modal';
import { Button } from '@twilio-paste/core/button';
import { Checkbox } from '@twilio-paste/core/checkbox';
import { DataGrid, DataGridHead, DataGridRow, DataGridHeader, DataGridBody, DataGridCell } from '@twilio-paste/core/data-grid';
import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';
import { Input } from '@twilio-paste/core/input';  // Add Input for Search
import Papa from 'papaparse';

const fetchContacts = async () => {
  try {
    const response = await fetch('https://flex-omnichannel-campaigns-3419.twil.io/fetch-contacts', {
      method: 'GET'
    });

    const data = await response.json();
    if (data.success) {
      // Parse the CSV data using PapaParse
      const parsedData = Papa.parse(data.data, {
        header: true,
        skipEmptyLines: true,
      });
      return parsedData.data; // Return the array of parsed contacts
    } else {
      console.error('Failed to fetch contacts:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

const ContactModal = ({ isOpen, onClose, onContactsSelect }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // Search term
  const [filteredContacts, setFilteredContacts] = useState([]);  // Filtered contacts

  useEffect(() => {
    const loadContacts = async () => {
      const fetchedContacts = await fetchContacts();
      setContacts(fetchedContacts);
      setFilteredContacts(fetchedContacts);  // Initialize filtered contacts
    };

    if (isOpen) {
      loadContacts(); // Fetch contacts only when modal is opened
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) =>
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, contacts]);

  const handleContactSelect = (contactId) => {
    setSelectedContacts((prevSelectedContacts) =>
      prevSelectedContacts.includes(contactId)
        ? prevSelectedContacts.filter((id) => id !== contactId)
        : [...prevSelectedContacts, contactId]
    );
  };

  // Select all contacts
  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);  // Deselect all
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.phone));  // Select all filtered contacts
    }
  };

  const handleSubmit = () => {
    const selectedContactDetails = contacts.filter((contact) =>
      selectedContacts.includes(contact.phone)
    );
    onContactsSelect(selectedContactDetails); // Send the selected contacts back to parent component
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} ariaLabel="Contact Modal" size="wide">
      <ModalHeader>Select Contacts to Send Template</ModalHeader>
      <ModalBody>
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
                  <DataGridHeader>Name</DataGridHeader>
                  <DataGridHeader>Phone</DataGridHeader>
                  <DataGridHeader>Email</DataGridHeader>
                </DataGridRow>
              </DataGridHead>
              <DataGridBody>
                {filteredContacts.map((contact, index) => (
                  <DataGridRow key={index}>
                    <DataGridCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.phone)}
                        onChange={() => handleContactSelect(contact.phone)}
                      >
                      </Checkbox>
                    </DataGridCell>
                    <DataGridCell>{contact.first_name} {contact.last_name}</DataGridCell>
                    <DataGridCell>{contact.phone}</DataGridCell>
                    <DataGridCell>{contact.email}</DataGridCell>
                  </DataGridRow>
                ))}
              </DataGridBody>
            </DataGrid>
          </>
        ) : (
          <Text>No contacts available.</Text>
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
