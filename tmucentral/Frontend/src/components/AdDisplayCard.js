import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'; 
import AdCard from './AdCard';
import CategorySidebar from './CategorySidebar';
import './AdDisplayCard.css'; 

const AdDisplayCard = ({ onFormSubmit }) => {
    const [ads, setAds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const categories = [
        { name: "All" }, 
        { name: "Academic Services", id: "Academic Services" }, 
        { name: "Items for Sale", id: "Items for Sale" }, 
        { name: "Items Wanted", id: "Items Wanted" }
    ];
    const [selectedPriceRange, setSelectedPriceRange] = useState("");

  
    useEffect(() => {
        const PORT = process.env.PORT || 3005;
        const url = `http://localhost:${PORT}/api/database/getAds`;
        fetch(url)
            .then((resp) => {
                if (!resp.ok) {
                    throw new Error("Network response was not okay");
                }
                return resp.json();
            })
            .then(ads => setAds(ads.Ads))
            .catch(err => console.error(err));
    }, []); 

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };

    const onSelectPriceRange = (priceRange) => {
        setSelectedPriceRange(priceRange);
    }

    // Helper function to parse price range and filter ads
    const filterAdsByPrice = (ads, priceRange) => {
        if (!priceRange) return ads; // No filter applied
        // print all category inside ads
        console.log(ads)

        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        return ads.filter(ad => {
            const price = Number(ad.price); // Ensure the price is a number
            // Filter logic
            return price >= minPrice && (maxPrice ? price <= maxPrice : true);
        });
    };

    const filterAdsByCategory = (ads, categoryId) => {
        if (!categoryId || categoryId === "All") return ads; // No filter applied
        return ads.filter(ad => ad.category === categoryId.toLowerCase());
    };

    const filteredAds = filterAdsByCategory(filterAdsByPrice(ads, selectedPriceRange), selectedCategory);

    return (
        <Container className="ad-grid-container">
            <Row>
                <Col md={3}>
                    <CategorySidebar
                        categories={categories}
                        onSelectCategory={handleSelectCategory}
                        onSelectPriceRange={onSelectPriceRange}
                    />
                </Col>
                <Col md={9}>
                    <Row> {/* Start of Ad Cards Grid */}
                        {filteredAds.map((ad) => (
                            <Col sm={6} lg={4} xl={3} key={ad.id}> {/* Adjust the size props as needed */}
                                <AdCard
                                    price={ad.price}
                                    title={ad.title}
                                    description={ad.description}
                                    image={ad.image}
                                    postDate={ad.postDate}
                                    location={ad.location}
                                />
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default AdDisplayCard;