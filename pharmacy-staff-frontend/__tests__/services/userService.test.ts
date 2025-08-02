import { describe, it, expect, beforeEach } from '@jest/globals'
import { api } from '@/lib/api'
import { userService } from '@/lib/services/userService'

// Mock the entire api module
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  createQueryParams: jest.fn()
}))

const mockedApi = jest.mocked(api)
const mockedCreateQueryParams = jest.mocked(require('@/lib/api').createQueryParams)

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users without filters', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, first_name: 'John', last_name: 'Doe', role: 'customer' },
            { id: 2, first_name: 'Jane', last_name: 'Smith', role: 'pharmacist' }
          ]
        }
      }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await userService.getUsers()

      expect(mockedApi.get).toHaveBeenCalledWith('/users/')
      expect(result).toEqual(mockResponse.data.results)
    })

    it('should fetch users with role filter', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 2, first_name: 'Jane', last_name: 'Smith', role: 'pharmacist' }
          ]
        }
      }

      const filters = { role: 'pharmacist' }
      mockedCreateQueryParams.mockReturnValue('?role=pharmacist')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await userService.getUsers(filters)

      expect(mockedCreateQueryParams).toHaveBeenCalledWith(filters)
      expect(mockedApi.get).toHaveBeenCalledWith('/users/?role=pharmacist')
      expect(result).toEqual(mockResponse.data.results)
    })

    it('should handle API response without results array', async () => {
      const mockResponse = {
        data: [
          { id: 1, first_name: 'John', last_name: 'Doe', role: 'customer' }
        ]
      }

      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await userService.getUsers()

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle network errors', async () => {
      mockedCreateQueryParams.mockReturnValue('')
      mockedApi.get.mockRejectedValue(new Error('Network timeout'))

      await expect(userService.getUsers()).rejects.toThrow('Network timeout')
    })
  })

  describe('getUser', () => {
    it('should fetch single user by ID', async () => {
      const mockResponse = {
        data: { id: 1, first_name: 'John', last_name: 'Doe', role: 'customer' }
      }

      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await userService.getUser(1)

      expect(mockedApi.get).toHaveBeenCalledWith('/users/1/')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle user not found (404)', async () => {
      mockedApi.get.mockRejectedValue({
        response: { status: 404, data: { message: 'User not found' } }
      })

      await expect(userService.getUser(999)).rejects.toThrow()
    })

    it('should handle invalid ID parameter', async () => {
      await expect(userService.getUser(null as any)).rejects.toThrow()
    })
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'customer',
        phone: '555-0123'
      }

      const mockResponse = {
        data: { id: 1, ...userData, created_at: '2024-01-01T00:00:00Z' }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await userService.createUser(userData)

      expect(mockedApi.post).toHaveBeenCalledWith('/users/', userData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation errors (400)', async () => {
      const userData = {
        first_name: '',
        last_name: 'Doe',
        email: 'invalid-email',
        role: 'invalid_role'
      }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            first_name: ['This field cannot be blank'],
            email: ['Enter a valid email address'],
            role: ['Invalid choice']
          }
        }
      })

      await expect(userService.createUser(userData as any)).rejects.toThrow()
    })

    it('should handle duplicate email errors', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'existing@example.com',
        role: 'customer'
      }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            email: ['User with this email already exists']
          }
        }
      })

      await expect(userService.createUser(userData)).rejects.toThrow()
    })
  })

  describe('Factory Methods', () => {
    describe('createPharmacist', () => {
      it('should create pharmacist with proper defaults', async () => {
        const pharmacistData = {
          first_name: 'Dr. Sarah',
          last_name: 'Wilson',
          email: 'sarah@pharmacy.com',
          license_number: 'PHM12345'
        }

        const mockResponse = {
          data: { 
            id: 1, 
            ...pharmacistData, 
            role: 'pharmacist',
            permissions: ['validate_prescriptions', 'manage_inventory'],
            created_at: '2024-01-01T00:00:00Z'
          }
        }

        mockedApi.post.mockResolvedValue(mockResponse)

        const result = await userService.createPharmacist(pharmacistData)

        expect(mockedApi.post).toHaveBeenCalledWith('/users/create-pharmacist/', pharmacistData)
        expect(result).toEqual(mockResponse.data)
        expect(result.role).toBe('pharmacist')
      })

      it('should handle missing license number', async () => {
        const pharmacistData = {
          first_name: 'Dr. Sarah',
          last_name: 'Wilson',
          email: 'sarah@pharmacy.com'
        }

        mockedApi.post.mockRejectedValue({
          response: { 
            status: 400, 
            data: { 
              license_number: ['This field is required for pharmacist creation']
            }
          }
        })

        await expect(userService.createPharmacist(pharmacistData as any)).rejects.toThrow()
      })
    })

    describe('createVipCustomer', () => {
      it('should create VIP customer with benefits', async () => {
        const vipData = {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '555-0123'
        }

        const mockResponse = {
          data: { 
            id: 1, 
            ...vipData, 
            role: 'vip_customer',
            loyalty_tier: 'gold',
            discount_rate: 0.10,
            benefits: ['priority_service', 'free_delivery', '10_percent_discount'],
            created_at: '2024-01-01T00:00:00Z'
          }
        }

        mockedApi.post.mockResolvedValue(mockResponse)

        const result = await userService.createVipCustomer(vipData)

        expect(mockedApi.post).toHaveBeenCalledWith('/users/create-vip-customer/', vipData)
        expect(result).toEqual(mockResponse.data)
        expect(result.role).toBe('vip_customer')
        expect(result.benefits).toContain('10_percent_discount')
      })

      it('should handle VIP creation with existing customer data', async () => {
        const vipData = {
          first_name: 'John',
          last_name: 'Doe',
          email: 'existing@example.com'
        }

        const mockResponse = {
          data: { 
            id: 1, 
            ...vipData, 
            role: 'vip_customer',
            upgraded_from: 'customer',
            upgrade_date: '2024-01-01T00:00:00Z'
          }
        }

        mockedApi.post.mockResolvedValue(mockResponse)

        const result = await userService.createVipCustomer(vipData)

        expect(result.upgraded_from).toBe('customer')
        expect(result.upgrade_date).toBeDefined()
      })
    })
  })

  describe('updateUser', () => {
    it('should update user with PATCH request', async () => {
      const updateData = { first_name: 'Johnny', phone: '555-9999' }
      const mockResponse = {
        data: { 
          id: 1, 
          first_name: 'Johnny', 
          last_name: 'Doe', 
          phone: '555-9999',
          updated_at: '2024-01-01T12:00:00Z'
        }
      }

      mockedApi.patch.mockResolvedValue(mockResponse)

      const result = await userService.updateUser(1, updateData)

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/1/', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle partial updates', async () => {
      const updateData = { phone: '555-1111' }
      const mockResponse = {
        data: { 
          id: 1, 
          first_name: 'John', 
          last_name: 'Doe', 
          phone: '555-1111'
        }
      }

      mockedApi.patch.mockResolvedValue(mockResponse)

      const result = await userService.updateUser(1, updateData)

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/1/', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should validate email format on update', async () => {
      const updateData = { email: 'invalid-email' }

      mockedApi.patch.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            email: ['Enter a valid email address']
          }
        }
      })

      await expect(userService.updateUser(1, updateData)).rejects.toThrow()
    })
  })

  describe('upgradeToVip', () => {
    it('should upgrade customer to VIP status', async () => {
      const upgradeData = { reason: 'High purchase volume' }
      const mockResponse = {
        data: { 
          id: 1, 
          first_name: 'John',
          last_name: 'Doe',
          role: 'vip_customer',
          previous_role: 'customer',
          upgrade_date: '2024-01-01T00:00:00Z',
          upgrade_reason: 'High purchase volume',
          benefits: ['priority_service', 'free_delivery', '10_percent_discount']
        }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await userService.upgradeToVip(1, upgradeData)

      expect(mockedApi.post).toHaveBeenCalledWith('/users/1/upgrade-to-vip/', upgradeData)
      expect(result).toEqual(mockResponse.data)
      expect(result.role).toBe('vip_customer')
      expect(result.previous_role).toBe('customer')
    })

    it('should handle upgrade of already VIP customer', async () => {
      const upgradeData = { reason: 'Reward renewal' }

      mockedApi.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'User is already a VIP customer'
          }
        }
      })

      await expect(userService.upgradeToVip(1, upgradeData)).rejects.toThrow()
    })

    it('should handle upgrade without reason', async () => {
      const mockResponse = {
        data: { 
          id: 1, 
          role: 'vip_customer',
          upgrade_date: '2024-01-01T00:00:00Z',
          upgrade_reason: 'Manual upgrade'
        }
      }

      mockedApi.post.mockResolvedValue(mockResponse)

      const result = await userService.upgradeToVip(1)

      expect(mockedApi.post).toHaveBeenCalledWith('/users/1/upgrade-to-vip/', undefined)
      expect(result.upgrade_reason).toBe('Manual upgrade')
    })
  })

  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      mockedApi.delete.mockResolvedValue({ data: {} })

      await userService.deleteUser(1)

      expect(mockedApi.delete).toHaveBeenCalledWith('/users/1/')
    })

    it('should handle user not found for deletion', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { status: 404, data: { message: 'User not found' } }
      })

      await expect(userService.deleteUser(999)).rejects.toThrow()
    })

    it('should handle deletion conflicts with orders', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Cannot delete user with existing orders'
          }
        }
      })

      await expect(userService.deleteUser(1)).rejects.toThrow()
    })

    it('should handle deletion conflicts with prescriptions', async () => {
      mockedApi.delete.mockRejectedValue({
        response: { 
          status: 400, 
          data: { 
            error: 'Cannot delete pharmacist with validated prescriptions'
          }
        }
      })

      await expect(userService.deleteUser(2)).rejects.toThrow()
    })
  })

  describe('Role-based Queries', () => {
    describe('getUsersByRole', () => {
      it('should get customers (regular and VIP)', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 1, role: 'customer', first_name: 'John' },
              { id: 2, role: 'vip_customer', first_name: 'Jane' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?role=customer')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await userService.getUsersByRole('customer')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ role: 'customer' })
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should get pharmacists', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 3, role: 'pharmacist', first_name: 'Dr. Sarah', license_number: 'PHM12345' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?role=pharmacist')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await userService.getUsersByRole('pharmacist')

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ role: 'pharmacist' })
        expect(result).toEqual(mockResponse.data.results)
      })

      it('should get staff members', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 4, role: 'manager', first_name: 'Alice' },
              { id: 5, role: 'cashier', first_name: 'Bob' }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?role=manager')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await userService.getUsersByRole('manager')

        expect(result).toEqual(mockResponse.data.results)
      })
    })

    describe('getCustomers', () => {
      it('should get all customers including VIP', async () => {
        const mockResponse = {
          data: {
            results: [
              { id: 1, role: 'customer', first_name: 'John' },
              { id: 2, role: 'vip_customer', first_name: 'Jane' }
            ]
          }
        }

        // Mock the service to simulate filtering for customer and vip_customer roles
        mockedCreateQueryParams.mockReturnValue('')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await userService.getCustomers()

        expect(mockedApi.get).toHaveBeenCalledWith('/users/')
        expect(result).toBeDefined()
      })
    })

    describe('getPharmacists', () => {
      it('should get all pharmacists', async () => {
        const mockResponse = {
          data: {
            results: [
              { 
                id: 1, 
                role: 'pharmacist', 
                first_name: 'Dr. Sarah',
                license_number: 'PHM12345',
                specializations: ['clinical_pharmacy', 'pediatric']
              }
            ]
          }
        }

        mockedCreateQueryParams.mockReturnValue('?role=pharmacist')
        mockedApi.get.mockResolvedValue(mockResponse)

        const result = await userService.getPharmacists()

        expect(mockedCreateQueryParams).toHaveBeenCalledWith({ role: 'pharmacist' })
        expect(result).toEqual(mockResponse.data.results)
      })
    })
  })
})