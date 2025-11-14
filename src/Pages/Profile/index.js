import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Profile = () => {
    const storedUserId = localStorage.getItem('user_id');
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState('');
    const [profileData, setProfileData] = useState({
        first_name: '',
        my_partner_name: '',
        mobile: '',
        my_partner_mobile: '',
        email: '',
        address: '',
        password: '',
        user_id: storedUserId || '',
        image_url: '',
    });

    // Fetch profile data on component mount
    useEffect(() => {
        if (!storedUserId) {
            Swal.fire('Error', 'User not logged in. Please login first.', 'error');
            setLoading(false);
            return;
        }

        axios.post('https://site2demo.in/marriageapp/api/profile-list', { user_id: storedUserId })
            .then(res => {
                if (res.data?.status && res.data.data) {
                    const profile = res.data.data;
                    setProfileData({
                        first_name: profile.first_name || '',
                        my_partner_name: profile.my_partner_name || '',
                        mobile: profile.mobile || '',
                        my_partner_mobile: profile.my_partner_mobile || '',
                        email: profile.email || '',
                        address: profile.address || '',
                        password: '',
                        user_id: storedUserId,
                        image_url: profile.image || '',
                    });
                    setImagePreview(profile.image || '');
                } else {
                    Swal.fire('Error', 'Failed to load profile data', 'error');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Profile fetch error:', err);
                Swal.fire('Error', 'Error fetching profile data', 'error');
                setLoading(false);
            });
    }, [storedUserId]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({ ...prev, image_file: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission for profile update
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('first_name', profileData.first_name);
            formData.append('my_partner_name', profileData.my_partner_name);
            formData.append('mobile', profileData.mobile);
            formData.append('my_partner_mobile', profileData.my_partner_mobile);
            formData.append('email', profileData.email);
            formData.append('address', profileData.address);
            formData.append('user_id', profileData.user_id);
            if (profileData.password) formData.append('password', profileData.password);
            if (profileData.image_file) formData.append('upload_photo', profileData.image_file);

            const response = await axios.post(
                'https://site2demo.in/marriageapp/api/admin-profile-update',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data?.status) {
                Swal.fire('Success', 'Profile updated successfully', 'success');
                if (response.data.data?.image) {
                    setImagePreview(response.data.data.image);
                    setProfileData(prev => ({
                        ...prev,
                        image_url: response.data.data.image,
                        password: '',
                        image_file: null,
                    }));
                }
            } else {
                Swal.fire('Error', response.data.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire('Error', 'Failed to update profile', 'error');
        }
    };

    if (loading) return <div className="text-center mt-5">Loading profile...</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">My Profile</h2>
            <form onSubmit={handleSubmit} className="row g-3">
                {/* Profile Image */}
                <div className="col-12 text-center mb-3">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Profile"
                            className="rounded-circle"
                            width={150}
                            height={150}
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="bg-secondary rounded-circle d-inline-block" style={{ width: 150, height: 150 }} />
                    )}
                    <div className="mt-2">
                        <input
                            type="file"
                            name="upload_photo"
                            accept="image/*"
                            className="form-control form-control-sm mt-2"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                {/* First Name */}
                <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter First Name"
                    />
                </div>

                {/* Partner Name */}
                <div className="col-md-6">
                    <label className="form-label">Partner Name</label>
                    <input
                        type="text"
                        name="my_partner_name"
                        value={profileData.my_partner_name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter Partner Name"
                    />
                </div>

                {/* Mobile */}
                <div className="col-md-6">
                    <label className="form-label">Mobile</label>
                    <input
                        type="text"
                        name="mobile"
                        value={profileData.mobile}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter Mobile"
                    />
                </div>

                {/* Partner Mobile */}
                <div className="col-md-6">
                    <label className="form-label">Partner Mobile</label>
                    <input
                        type="text"
                        name="my_partner_mobile"
                        value={profileData.my_partner_mobile}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter Partner Mobile"
                    />
                </div>

                {/* Email */}
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter Email"
                    />
                </div>

                {/* Password */}
                <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={profileData.password}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Leave blank to keep existing password"
                    />
                </div>

                {/* Address */}
                <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter Address"
                        rows={3}
                    />
                </div>

                {/* Submit Button */}
                <div className="col-12 text-center">
                    <button type="submit" className="btn btn-primary">
                        Update Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
