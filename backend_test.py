import requests
import sys
import json
from datetime import datetime

class StarTradeAPITester:
    def __init__(self, base_url="https://star-trade-intl.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - Response: {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"test_user_{timestamp}@startrade.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['email']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_id:
            return False
            
        login_data = {
            "email": self.user_id,
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return response is not None

    def test_get_settings(self):
        """Test getting site settings"""
        response = self.run_test(
            "Get Site Settings",
            "GET",
            "settings",
            200
        )
        
        if response:
            # Verify required fields
            required_fields = ['hero', 'about', 'differentials', 'stats', 'contact']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Settings - {field} field", False, f"Missing {field} in response")
                    return False
            return True
        return False

    def test_update_settings(self):
        """Test updating site settings"""
        # First get current settings
        current_settings = self.run_test(
            "Get Settings for Update",
            "GET",
            "settings",
            200
        )
        
        if not current_settings:
            return False
        
        # Update a field
        current_settings['hero']['title'] = "Updated Test Title"
        
        response = self.run_test(
            "Update Site Settings",
            "PUT",
            "settings",
            200,
            data=current_settings
        )
        return response is not None

    def test_get_areas(self):
        """Test getting areas"""
        response = self.run_test(
            "Get Areas",
            "GET",
            "areas",
            200
        )
        
        if response and isinstance(response, list):
            # Check if default areas exist
            if len(response) >= 4:
                # Look for specialty area (Rochas Ornamentais)
                specialty_found = any(area.get('is_specialty', False) for area in response)
                if not specialty_found:
                    self.log_test("Areas - Specialty Badge", False, "No specialty area found")
                else:
                    self.log_test("Areas - Specialty Badge", True, "Specialty area found")
            return True
        return False

    def test_create_area(self):
        """Test creating a new area"""
        test_area = {
            "title": "Test Area",
            "description": "This is a test area for automated testing",
            "image_url": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
            "icon": "Globe",
            "is_specialty": False,
            "badge_text": "Test Setor",
            "badge_color": "#1E3A8A",
            "overlay_color": "rgba(30, 58, 138, 0.7)",
            "button_text": "Test Button",
            "button_link": "/test",
            "is_active": True,
            "order": 99
        }
        
        response = self.run_test(
            "Create Area",
            "POST",
            "areas",
            200,
            data=test_area
        )
        
        if response and 'id' in response:
            self.test_area_id = response['id']
            return True
        return False

    def test_update_area(self):
        """Test updating an area"""
        if not hasattr(self, 'test_area_id'):
            return False
            
        update_data = {
            "title": "Updated Test Area",
            "description": "Updated description",
            "image_url": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
            "icon": "Globe",
            "is_specialty": True,
            "badge_text": "NOSSA ESPECIALIDADE",
            "badge_color": "#D4AF37",
            "overlay_color": "rgba(212, 175, 55, 0.7)",
            "button_text": "Updated Button",
            "button_link": "/updated",
            "is_active": True,
            "order": 99
        }
        
        response = self.run_test(
            "Update Area",
            "PUT",
            f"areas/{self.test_area_id}",
            200,
            data=update_data
        )
        return response is not None

    def test_delete_area(self):
        """Test deleting an area"""
        if not hasattr(self, 'test_area_id'):
            return False
            
        response = self.run_test(
            "Delete Area",
            "DELETE",
            f"areas/{self.test_area_id}",
            200
        )
        return response is not None

    def test_get_blog_posts(self):
        """Test getting blog posts"""
        response = self.run_test(
            "Get Blog Posts",
            "GET",
            "blog",
            200
        )
        return response is not None

    def test_create_blog_post(self):
        """Test creating a blog post"""
        test_post = {
            "title": "Test Blog Post",
            "excerpt": "This is a test blog post excerpt",
            "content": "This is the full content of the test blog post. It contains detailed information about our test.",
            "cover_image": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
            "category": "Test Category",
            "tags": ["test", "automation", "api"],
            "is_featured": False,
            "is_published": True,
            "meta_title": "Test Blog Post - Star Trade",
            "meta_description": "Test blog post for API testing"
        }
        
        response = self.run_test(
            "Create Blog Post",
            "POST",
            "blog",
            201,
            data=test_post
        )
        
        if response and 'id' in response:
            self.test_post_id = response['id']
            return True
        return False

    def test_update_blog_post(self):
        """Test updating a blog post"""
        if not hasattr(self, 'test_post_id'):
            return False
            
        update_data = {
            "title": "Updated Test Blog Post",
            "excerpt": "Updated excerpt",
            "content": "Updated content",
            "cover_image": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
            "category": "Updated Category",
            "tags": ["updated", "test"],
            "is_featured": True,
            "is_published": True,
            "meta_title": "Updated Test Post",
            "meta_description": "Updated description"
        }
        
        response = self.run_test(
            "Update Blog Post",
            "PUT",
            f"blog/{self.test_post_id}",
            200,
            data=update_data
        )
        return response is not None

    def test_delete_blog_post(self):
        """Test deleting a blog post"""
        if not hasattr(self, 'test_post_id'):
            return False
            
        response = self.run_test(
            "Delete Blog Post",
            "DELETE",
            f"blog/{self.test_post_id}",
            200
        )
        return response is not None

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+55 11 99999-9999",
            "company": "Test Company",
            "message": "This is a test message from automated testing",
            "area_of_interest": "Test Area"
        }
        
        response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            201,
            data=contact_data
        )
        
        if response and 'id' in response:
            self.test_message_id = response['id']
            return True
        return False

    def test_get_messages(self):
        """Test getting contact messages"""
        response = self.run_test(
            "Get Contact Messages",
            "GET",
            "messages",
            200
        )
        return response is not None

    def test_mark_message_read(self):
        """Test marking message as read"""
        if not hasattr(self, 'test_message_id'):
            return False
            
        response = self.run_test(
            "Mark Message Read",
            "PUT",
            f"messages/{self.test_message_id}/read",
            200
        )
        return response is not None

    def test_delete_message(self):
        """Test deleting a message"""
        if not hasattr(self, 'test_message_id'):
            return False
            
        response = self.run_test(
            "Delete Message",
            "DELETE",
            f"messages/{self.test_message_id}",
            200
        )
        return response is not None

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "stats/dashboard",
            200
        )
        
        if response:
            required_stats = ['total_messages', 'unread_messages', 'total_posts', 'total_areas']
            for stat in required_stats:
                if stat not in response:
                    self.log_test(f"Dashboard Stats - {stat}", False, f"Missing {stat}")
                    return False
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Star Trade API Tests...")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n🔐 Authentication Tests")
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        self.test_user_login()
        self.test_get_current_user()
        
        # Settings Tests
        print("\n⚙️ Settings Tests")
        self.test_get_settings()
        self.test_update_settings()
        
        # Areas Tests
        print("\n🗺️ Areas Tests")
        self.test_get_areas()
        self.test_create_area()
        self.test_update_area()
        self.test_delete_area()
        
        # Blog Tests
        print("\n📝 Blog Tests")
        self.test_get_blog_posts()
        self.test_create_blog_post()
        self.test_update_blog_post()
        self.test_delete_blog_post()
        
        # Contact Tests
        print("\n📧 Contact Tests")
        self.test_contact_form()
        self.test_get_messages()
        self.test_mark_message_read()
        self.test_delete_message()
        
        # Dashboard Tests
        print("\n📊 Dashboard Tests")
        self.test_dashboard_stats()
        
        # Print Results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = StarTradeAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())