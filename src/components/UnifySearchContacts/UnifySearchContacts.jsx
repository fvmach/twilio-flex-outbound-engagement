import React, { useState } from "react";
import { Button, Input, Select, Table } from "@twilio-paste/core";

const UnifySearchContacts = ({ onSelectContacts }) => {
  const [identifier, setIdentifier] = useState("");
  const [traitKey, setTraitKey] = useState("");
  const [traitValue, setTraitValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);

    // Prepare the payload for the Twilio Function
    const payload = {
      identifier: identifier.trim(),
      traits: traitKey && traitValue ? { [traitKey]: traitValue.trim() } : null,
    };

    try {
      // Call the Twilio Function
      const response = await fetch("/search-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.profiles || []);
      } else {
        console.error("Search failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Search Contacts</h3>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Input
          placeholder="Identifier (e.g., email, user ID)"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          type="text"
          aria-label="Identifier"
        />
        <Select
          placeholder="Trait Key"
          value={traitKey}
          onChange={(e) => setTraitKey(e.target.value)}
        >
          <option value="">Select a Trait</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="name">Name</option>
          {/* Add more trait options as needed */}
        </Select>
        <Input
          placeholder="Trait Value"
          value={traitValue}
          onChange={(e) => setTraitValue(e.target.value)}
          type="text"
          aria-label="Trait Value"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading || (!identifier && !traitKey)}
          variant="primary"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      <Table striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((profile) => (
            <tr key={profile.id}>
              <td>{profile.id}</td>
              <td>{profile.traits.name || "N/A"}</td>
              <td>{profile.traits.email || "N/A"}</td>
              <td>{profile.traits.phone || "N/A"}</td>
              <td>
                <Button
                  onClick={() => onSelectContacts(profile)}
                  variant="secondary"
                  size="small"
                >
                  Select
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UnifySearchContacts;
