"""
Backend API Tests for Star Trade CMS
Tests multilingual functionality, settings API, and authentication
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@startrade.com"
ADMIN_PASSWORD = "StarTrade2024!"


class TestHealthAndSettings:
    """Test basic API health and settings endpoint"""
    
    def test_settings_endpoint_returns_200(self):
        """Test that /api/settings returns 200"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Settings endpoint returns 200")
    
    def test_settings_has_translatable_hero_title(self):
        """Test that hero.title is a TranslatableText object with pt, en, es"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Check hero exists
        assert "hero" in data, "Missing 'hero' in settings"
        hero = data["hero"]
        
        # Check title is TranslatableText format
        assert "title" in hero, "Missing 'title' in hero"
        title = hero["title"]
        assert isinstance(title, dict), f"hero.title should be dict, got {type(title)}"
        assert "pt" in title, "Missing 'pt' in hero.title"
        assert "en" in title, "Missing 'en' in hero.title"
        assert "es" in title, "Missing 'es' in hero.title"
        
        # Verify content is not empty
        assert len(title["pt"]) > 0, "hero.title.pt is empty"
        assert len(title["en"]) > 0, "hero.title.en is empty"
        assert len(title["es"]) > 0, "hero.title.es is empty"
        
        print(f"✓ Hero title PT: {title['pt'][:50]}...")
        print(f"✓ Hero title EN: {title['en'][:50]}...")
        print(f"✓ Hero title ES: {title['es'][:50]}...")
    
    def test_settings_has_translatable_hero_subtitle(self):
        """Test that hero.subtitle is a TranslatableText object"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        subtitle = data["hero"]["subtitle"]
        assert isinstance(subtitle, dict), f"hero.subtitle should be dict, got {type(subtitle)}"
        assert "pt" in subtitle and "en" in subtitle and "es" in subtitle
        print(f"✓ Hero subtitle has all 3 languages")
    
    def test_settings_has_translatable_hero_cta(self):
        """Test that hero.cta_text is a TranslatableText object"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        cta = data["hero"]["cta_text"]
        assert isinstance(cta, dict), f"hero.cta_text should be dict, got {type(cta)}"
        assert "pt" in cta and "en" in cta and "es" in cta
        print(f"✓ Hero CTA text has all 3 languages")
    
    def test_settings_has_translatable_about_fields(self):
        """Test that about section has TranslatableText fields"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        about = data["about"]
        
        # Check title
        assert isinstance(about["title"], dict), "about.title should be dict"
        assert "pt" in about["title"] and "en" in about["title"] and "es" in about["title"]
        
        # Check paragraph1
        assert isinstance(about["paragraph1"], dict), "about.paragraph1 should be dict"
        assert "pt" in about["paragraph1"] and "en" in about["paragraph1"] and "es" in about["paragraph1"]
        
        # Check paragraph2
        assert isinstance(about["paragraph2"], dict), "about.paragraph2 should be dict"
        assert "pt" in about["paragraph2"] and "en" in about["paragraph2"] and "es" in about["paragraph2"]
        
        print("✓ About section has all translatable fields")
    
    def test_settings_has_hero_video_url(self):
        """Test that hero has video_url for fullscreen video"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        assert "video_url" in data["hero"], "Missing video_url in hero"
        video_url = data["hero"]["video_url"]
        assert video_url.startswith("http"), f"video_url should be a URL, got: {video_url[:50]}"
        print(f"✓ Hero video URL: {video_url[:80]}...")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_with_valid_credentials(self):
        """Test login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        # If user doesn't exist, register first
        if response.status_code == 401:
            # Try to register
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "name": "Admin"
            })
            if reg_response.status_code in [200, 201]:
                # Try login again
                response = requests.post(f"{BASE_URL}/api/auth/login", json={
                    "email": ADMIN_EMAIL,
                    "password": ADMIN_PASSWORD
                })
        
        assert response.status_code == 200, f"Login failed with status {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        print(f"✓ Login successful for {ADMIN_EMAIL}")
        return data["access_token"]
    
    def test_login_with_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")
    
    def test_auth_me_with_valid_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login to test /auth/me")
        
        token = login_response.json()["access_token"]
        
        # Test /auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ /auth/me returns correct user: {data['email']}")


class TestAreasAPI:
    """Test areas CRUD endpoints"""
    
    def test_get_areas(self):
        """Test GET /api/areas"""
        response = requests.get(f"{BASE_URL}/api/areas")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Areas should be a list"
        print(f"✓ GET /api/areas returns {len(data)} areas")
    
    def test_areas_have_required_fields(self):
        """Test that areas have all required fields"""
        response = requests.get(f"{BASE_URL}/api/areas")
        data = response.json()
        
        if len(data) > 0:
            area = data[0]
            required_fields = ["id", "title", "description", "image_url", "icon"]
            for field in required_fields:
                assert field in area, f"Missing field '{field}' in area"
            print(f"✓ Areas have all required fields")
        else:
            print("⚠ No areas found to validate")


class TestBlogAPI:
    """Test blog endpoints"""
    
    def test_get_blog_posts(self):
        """Test GET /api/blog"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Blog posts should be a list"
        print(f"✓ GET /api/blog returns {len(data)} posts")
    
    def test_get_published_blog_posts(self):
        """Test GET /api/blog?published_only=true"""
        response = requests.get(f"{BASE_URL}/api/blog?published_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/blog?published_only=true returns {len(data)} posts")


class TestContactAPI:
    """Test contact form endpoint"""
    
    def test_submit_contact_form(self):
        """Test POST /api/contact"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_User",
            "email": "test@example.com",
            "phone": "+5511999999999",
            "company": "Test Company",
            "message": "This is a test message from automated testing"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Missing id in response"
        print(f"✓ Contact form submission successful, id: {data['id']}")


class TestSettingsUpdate:
    """Test settings update with authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            # Try to register
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "name": "Admin"
            })
            if reg_response.status_code in [200, 201]:
                return reg_response.json()["access_token"]
            pytest.skip("Could not authenticate")
        return response.json()["access_token"]
    
    def test_update_settings_requires_auth(self):
        """Test that PUT /api/settings requires authentication"""
        response = requests.put(f"{BASE_URL}/api/settings", json={})
        assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"
        print("✓ Settings update requires authentication")
    
    def test_get_and_update_settings(self, auth_token):
        """Test getting and updating settings with multilingual hero"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        settings = get_response.json()
        
        # Modify hero title (keep multilingual format)
        original_title = settings["hero"]["title"]
        
        # Update with same data (just to test the endpoint works)
        put_response = requests.put(
            f"{BASE_URL}/api/settings",
            json=settings,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert put_response.status_code == 200, f"Expected 200, got {put_response.status_code}: {put_response.text}"
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        updated_settings = verify_response.json()
        
        # Check that multilingual format is preserved
        assert isinstance(updated_settings["hero"]["title"], dict)
        assert "pt" in updated_settings["hero"]["title"]
        assert "en" in updated_settings["hero"]["title"]
        assert "es" in updated_settings["hero"]["title"]
        
        print("✓ Settings update preserves multilingual format")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
