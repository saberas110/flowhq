
class BaseError(Exception):
    """Base Error"""


class ServiceAccountValidationError(BaseError):
    """Service Account ValidationError"""

class OrganizationValidationError(BaseError):
    """Organization ValidationError"""