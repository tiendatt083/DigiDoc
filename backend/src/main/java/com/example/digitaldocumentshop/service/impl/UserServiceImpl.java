package com.example.digitaldocumentshop.service.impl;

import com.example.digitaldocumentshop.entity.User;
import com.example.digitaldocumentshop.repository.UserRepository;
import com.example.digitaldocumentshop.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User user) {
        User existing = getUserById(id);
        existing.setFullName(user.getFullName());
        existing.setPhoneNumber(user.getPhoneNumber());
        existing.setIsActive(user.getIsActive());
        existing.setRole(user.getRole());
        return userRepository.save(existing);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
