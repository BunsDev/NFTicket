import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { database } from "../firebase.js";
import { ref, set } from "firebase/database";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { storage } from "../firebase.js";
import { uploadBytes, ref as sRef } from "firebase/storage";
import { createEvent, getLastEventId } from "../interfaces/NFTicket_interface";
import { getEventImageUrl, uploadMetadata } from "../interfaces/firebase_interface.js";
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from "react-router-dom";


class CreateEventForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      eventName: "",
      eventDescription: "",
      numGATickets: "",
      gaTicketPrice: "",
      eventId: 0,
      selectedImage: null,
      eventCategory: "",
      eventCreated: false,
      creating: false
    };

    this.handleCreate = this.handleCreate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }


  async handleCreate(event) {
    //alert("Creating Event: " + this.state.eventName);
    this.setState({ creating: true });
    event.preventDefault();

    // TODO: redirect to confirmation page
    // determine event id and create event
    createEvent(
      this.state.numGATickets,
      this.state.gaTicketPrice
    ).then((response) => {
        console.log("create event response: ", response);
        getLastEventId().then((eventId) => {
            // write to database
            this.setState({ eventId: eventId }, async () => {
              // upload image
              console.log("uploading image...")
              console.log(eventId);
              console.log(this.state.selectedImage);
              await this.uploadImage(eventId, this.state.selectedImage);

              // update events
              console.log(
                `adding to events/${eventId} wtih state: ${JSON.stringify(this.state)}`
              );
              set(ref(database, "events/" + eventId), this.state);

              // create and upload metadata
              const metadata = {
                  name: `${this.state.eventName} Ticket`,
                  description: `Digital Ticket for ${this.state.eventName}`,
                  image: await getEventImageUrl(eventId),
              };

              //this.state.numGATickets = parseInt(this.state.numGATickets);
              this.setState({ numGATickets: parseInt(this.state.numGATickets) });
              for (let i = 0; i <= this.state.numGATickets; i++) {
                  const ticketId = eventId * 1000000 + i;
                  await uploadMetadata(ticketId, metadata);
              }


            });

            //alert("Event Created" + this.state.eventName);
            this.setState({ eventCreated: true, creating: false }, () => {
              // redirect to events page
              this.props.history.push("/events");
            });

        });
    });
  };



  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });

    console.log(this.state);
  }

  //setting image for event cover
  async uploadImage(eventId, file) {
    const storageRef = sRef(storage, `events/${eventId}/image.jpg`);
    await uploadBytes(storageRef, file);
    console.log("uploaded image");
  }


  render() {
    return (
      <Box
        stlye={{ justifyContent: "center", alignItems: "center" }}
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "90%" },
        }}
        noValidate
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "25px",
            backgroundColor: "#f5f5f5",
            padding: "25px",
            width: "100ch",
          }}
        >
          <TextField
            id="eventName"
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              width: "100%",
            }}
            required
            label="Event Name"
            name="eventName"
            onChange={this.handleChange}
            data-test="event-name-field"
          />
          <TextField
            id="eventDescription"
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              width: "100%",
            }}
            required
            multiline
            minRows={3}
            maxRows={10}
            label="Description"
            name="eventDescription"
            onChange={this.handleChange}
            data-test="event-description-field"
          />
          <TextField
            id="numGATickets"
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              width: "100%",
            }}
            required
            label="Number of GA Tickets"
            name="numGATickets"
            type="number"
            onChange={this.handleChange}
            data-test="num-tickets-field"
          />
          <TextField
            id="gaTicketPrice"
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              width: "100%",
              }}
            required
            label="GA Ticket Price"
            name="gaTicketPrice"
            type="number"
            onChange={this.handleChange}
            data-test="ticket-price-field"
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              style={{
                marginTop: "25px",
                marginBottom: "25px",
                alignItems: "center",

              }}
              required
              label="category"
              name="eventCategory"
              id="eventCategory"
              onChange={this.handleChange}
              data-test="category-dropdown"
            >
              <MenuItem data-test="restaurant-category" value={"Restaurants"}>Restaurants</MenuItem>
              <MenuItem data-test="festival-category" value={"Festivals"}>Festivals</MenuItem>
              <MenuItem data-test="sports-category" value={"Sports"}>Sports</MenuItem>
              <MenuItem data-test="travel-category" value={"Travel"}>Travel</MenuItem>
              <MenuItem data-test="charity-category" value={"Charity"}>Charity</MenuItem>
              <MenuItem data-test="virtual-category" value={"Virtual"}>Virtual</MenuItem>
              <MenuItem data-test="health-category" value={"Health"}>Health</MenuItem>
            </Select>
          </FormControl>
            {this.state.selectedImage && (
                <div>
                  <img
                    alt="not found"
                    width={"250px"}
                    src={URL.createObjectURL(this.state.selectedImage)}
                  />
                  <br />
                  <IconButton
                    color="primary"
                    component="label"
                    onClick={() => {
                      this.setState({ selectedImage: null });
                      this.fileInput.value = "";
                    }}
                  >
                    <AttachFileIcon fontSize="medium" /> Remove Image
                  </IconButton>
                </div>
              )}
              {!this.state.selectedImage && (
                <IconButton color="primary" component="label">
                  <input
                    ref={(ref) => (this.fileInput = ref)}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      console.log(e.target.files[0]);
                      this.setState({ selectedImage: e.target.files[0] });
                    }}
                    data-test="upload-image-input"
                  />
                  <AttachFileIcon data-test="upload-image-icon" fontSize="medium" /> Upload Image
                </IconButton>
              )}
          <Button
            id="createEventButton"
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              width: "50ch",
            }}
            variant="contained"
            onClick={this.handleCreate}
            data-test="create-event-submit-button"
          >
            Create
          </Button>
          <Dialog open={this.state.creating}>
          <DialogTitle>Creating event...</DialogTitle>
          <DialogContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </DialogContent>
        </Dialog>
        </div>
      </Box>
    );
  }
}

export default withRouter(CreateEventForm);
