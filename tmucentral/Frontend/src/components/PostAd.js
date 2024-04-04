import React, { useRef, useState } from 'react';
import { Card, Form, Button, InputGroup, FormControl, DropdownButton, Dropdown, Col, Row, Alert } from 'react-bootstrap';

import { useAuth } from "../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"

const PostAd = ({ onFormSubmit }) => {
  const { currentUser, logout } = useAuth();
  const titleRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const locationRef = useRef();
  const imageRef = useRef();
  const categoryRef = useRef();
  const [category, setCategory] = useState('');
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const email = currentUser.email;
  const navigate = useNavigate() 
  const imgN = "https://static.vecteezy.com/system/resources/previews/005/337/799/original/icon-image-not-found-free-vector.jpg";
  const handleCategorySelect = (cat) => {
    setCategory(cat);
  };

  async function handleAdSubmit(e) {
    e.preventDefault();
    try {
      let imageBase64 = null;

      if (image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          imageBase64 = reader.result;

          // Resize image if initial size is more than (130/2 + 6) = 71KB
          if (calculateBase64Size(imageBase64) > 130) {
            resizeImage(imageBase64, function(resizedImage) {
              submitAd(resizedImage);
            });
          } else {
            submitAd(imageBase64);
          }
        };
        reader.readAsDataURL(image);
      } else {

        submitAd(imgN);
      }
    } catch {
      setError("Failed to post advertisement");
    }
  }

  async function submitAd(imageBase64) {
    let inputLocation = locationRef.current.value;
    let lowercaseLocation = inputLocation.toLowerCase();
    let FirstUppercaseLocation = lowercaseLocation.substring(0, 1).toUpperCase();
    lowercaseLocation = lowercaseLocation.substring(1);
    let location = FirstUppercaseLocation + lowercaseLocation;
    const newAd = {
      postDate: Date.now(),
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      price: priceRef.current.value,
      location: location,
      sold: false,
      image: imageBase64,
      category: category,
      email: email,
    };
    const msg = "Advertisement submitted successfully!";
    onFormSubmit('/postAds', newAd, msg);
    navigate("/myads") 
  }

  // Function to resize the image until its size is less than (130/2 + 5) = 71KB
  function resizeImage(imageData, callback) {
    const img = new Image();
    img.src = imageData;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;
      const aspectRatio = width / height;
      const targetSize = 130; // (130/2 + 6) = 71KB in bytes
      let quality = 0.9;
      let calc = calculateBase64Size(imageData);

      // Resize until the size is less than the target size
      while (calc > targetSize) {
        width *= 0.9;
        height = width / aspectRatio;
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        imageData = canvas.toDataURL('image/jpeg', quality);
        calc = calculateBase64Size(imageData);
      }
      // Invoke callback with the resized image data
      callback(imageData);
    };
  }

  function calculateBase64Size(base64String) {
    // Remove data URL prefix
    const base64WithoutPrefix = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    const sizeInBytes = Math.ceil((base64WithoutPrefix.length * 4) / 3);
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB; // Return size in KB
  }

  return (
    <Card className="my-4 mx-auto" style={{ maxWidth: '800px' }}>
      <Card.Body>
        <h2 className="text-center mb-4">Post New Advertisement</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleAdSubmit}>
               <Form.Group as={Row} controlId="formGridTitle" className="mb-3">
            <Form.Label column sm="2" className="fw-bold">Title</Form.Label>
            <Col sm="10">
               <Form.Control 
                type="text" 
                ref={titleRef}
                placeholder="Enter title"
                required
              />
            </Col>
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} sm="6" controlId="formGridPrice">
              <Form.Label className="fw-bold">Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl 
                  aria-label="Amount (to the nearest dollar)" 
                  ref={priceRef} 
                  required
                />
                <InputGroup.Text>.00</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group as={Col} sm="6" controlId="formGridLocation">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control 
                type="text"
                ref={locationRef}
                placeholder="City, Province/Territory" 
                required
              />
            </Form.Group>
          </Row>

          <Form.Group controlId="formGridDescription" className="mb-3">
            <Form.Label className="fw-bold">Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              ref={descriptionRef}
            />
          </Form.Group>

          <Form.Group controlId="formGridImages" className="mb-3">
            <Form.Label className="fw-bold">Upload Images</Form.Label>
            <Form.Control type="file" ref={imageRef} onChange={(e) => setImage(e.target.files[0])} />
            {image && <img src={URL.createObjectURL(image)} alt="Uploaded" style={{ maxWidth: '100px', marginTop: '10px' }} />}
          </Form.Group>

          <Row className="mb-3">
            <Col sm="6">
              <DropdownButton 
                id="dropdown-item-button" 
                title={category ? category.replace(/([A-Z])/g, ' $1').trim() : "Select a category"} // Show selected category or default text
                variant="light"
                className="text-secondary w-100"
                ref={categoryRef}>
                <Dropdown.Item onClick={() => handleCategorySelect('Academic Services')}>Academic Services</Dropdown.Item>
                <Dropdown.Item onClick={() => handleCategorySelect('Items for Sale')}>Items for Sale</Dropdown.Item>
                <Dropdown.Item onClick={() => handleCategorySelect('Items Wanted')}>Items Wanted</Dropdown.Item>
              </DropdownButton>
            </Col>
            <Col sm="6">
              <Button variant="primary" type="submit" className="w-100">
                 Submit Ad
             </Button>
            </Col>

          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PostAd;