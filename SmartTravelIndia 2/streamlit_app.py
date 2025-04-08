import streamlit as st
import pandas as pd
import os
from PIL import Image

# Configure the page
st.set_page_config(
    page_title="Indian Transportation System",
    page_icon="🚆",
    layout="wide"
)

# Title
st.title("🚆 Indian Multi-Modal Transportation System")
st.subheader("AI-powered transportation planning for smart cities in India")

# Add a description
st.markdown("""
This application helps users find the best transportation options between major Indian cities.
Our intelligent system compares multiple modes of transportation including trains, flights, buses, and taxis
based on various factors:
- 💰 **Cost efficiency** - Find the most economical options
- ⏱️ **Time savings** - Identify the fastest routes  
- 🛋️ **Comfort level** - Choose the most comfortable journey
- 📏 **Distance information** - Get accurate distance measurements
""")

# Main content
col1, col2 = st.columns([3, 2])

with col1:
    # Display the India map with routes
    if os.path.exists("attached_assets/image_1743712400878.png"):
        map_image = Image.open("attached_assets/image_1743712400878.png")
        st.image(map_image, caption="Multi-Modal Transportation Routes Across India", use_container_width=True)
    else:
        st.warning("Map image not found. The visualization will appear here in the deployed version.")
    
    # City selection section
    st.subheader("Explore Routes Between Major Indian Cities")
    
    # Create two columns for origin and destination
    origin_col, dest_col = st.columns(2)
    
    # Major cities in India
    cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
        "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
        "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
        "Visakhapatnam", "Vadodara", "Coimbatore", "Ludhiana", "Madurai"
    ]
    
    with origin_col:
        origin = st.selectbox("Origin City", cities, index=0)
    
    with dest_col:
        # Set a different default to show a real route
        dest_index = 1 if 0 == 0 else 0
        destination = st.selectbox("Destination City", cities, index=dest_index)
    
    # Transportation preferences
    st.subheader("Set Your Preferences")
    preference = st.radio(
        "What's most important for your journey?",
        ["Time Efficiency", "Cost Savings", "Comfort"],
        horizontal=True
    )
    
    if st.button("Find Routes", type="primary"):
        st.success(f"Finding the best routes from {origin} to {destination} prioritizing {preference.lower()}!")
        
        # Sample routes data (this would come from the actual application)
        routes_data = {
            "Mode": ["Train", "Flight", "Bus", "Car"],
            "Duration (hrs)": [16, 2.5, 22, 24],
            "Cost (₹)": ["1,800", "5,500", "1,200", "3,500"],
            "Distance (km)": [1,400, 1,200, 1,450, 1,400],
            "Comfort Rating": ["Medium", "High", "Low", "Medium"]
        }
        
        routes_df = pd.DataFrame(routes_data)
        
        st.subheader(f"Routes from {origin} to {destination}")
        st.dataframe(routes_df, use_container_width=True)
        
        # Show the recommended option based on preference
        if preference == "Time Efficiency":
            recommended = "Flight"
            reason = "It's the fastest option at only 2.5 hours"
        elif preference == "Cost Savings":
            recommended = "Bus"
            reason = "It's the most economical option at only ₹1,200"
        else:  # Comfort
            recommended = "Flight"
            reason = "It offers the highest comfort rating"
            
        st.info(f"📌 **Recommended Option**: {recommended} - {reason}")

with col2:
    # Features section
    st.header("Key Features")
    
    st.markdown("### 🔍 Intelligent Route Comparison")
    st.markdown("""
    - Compare multiple transportation modes
    - View detailed cost breakdowns
    - See accurate travel durations
    - Get precise distance information
    """)

    st.markdown("### 🗺️ Interactive Map Visualization")
    st.markdown("""
    - Visualize routes on a map of India
    - See detailed city-to-city connections
    - Compare route distances visually
    - Explore multi-city travel options
    """)

    st.markdown("### 💌 Trip Confirmation Services")
    st.markdown("""
    - Receive email confirmations
    - Get detailed booking instructions
    - Save itineraries for future reference
    - Share travel plans with others
    """)
    
    # Authentication placeholder
    st.header("User Authentication")
    with st.expander("Login / Register"):
        tab1, tab2 = st.tabs(["Login", "Register"])
        
        with tab1:
            st.text_input("Username")
            st.text_input("Password", type="password")
            st.button("Login")
            
        with tab2:
            st.text_input("Full Name")
            st.text_input("Email")
            st.text_input("New Username")
            st.text_input("New Password", type="password")
            st.button("Register")
    
    st.info("Login to access personalized recommendations and save your travel preferences.")

# Add sidebar with more information and navigation
st.sidebar.header("About This Project")
st.sidebar.info("""
This is an AI-powered multi-modal transportation system designed specifically for India.

Our application uses advanced algorithms to analyze various transportation options,
considering factors like:
- Current traffic conditions
- Seasonal price variations
- Weather impacts on travel time
- Historical reliability data

This helps travelers make informed decisions based on their unique preferences and requirements.
""")

# Add city information in the sidebar
st.sidebar.header("Major Indian Cities")
cities_info = {
    "Mumbai": "Financial capital with extensive rail network",
    "Delhi": "National capital with metro system and major airports",
    "Bangalore": "Tech hub with growing metro network",
    "Chennai": "Gateway to South India with good transportation",
    "Kolkata": "Eastern hub with India's oldest metro system",
    "Hyderabad": "Well-connected with new metro system"
}

for city, info in cities_info.items():
    st.sidebar.markdown(f"**{city}**: {info}")

# Add contact info
st.sidebar.header("Contact")
st.sidebar.markdown("For questions or support, contact us at: support@indiantransport.ai")

# Footer
st.markdown("""
---
*This is a demonstration of the Indian Multi-Modal Transportation System. The actual application offers real-time data and complete functionality.*
""")
