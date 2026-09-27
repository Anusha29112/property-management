from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Property
from .serializers import PropertySerializer

# Create your views here.

class PropertyListView(APIView):
    def get(self, request):
        properties = Property.objects.all()
        serializer=PropertySerializer(properties,many=True)

        return Response(serializer.data)

    def post(self,request):
        serializer=PropertySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)

# pk-primary key
class PropertyDetailView(APIView):
    def get_property(self,pk):
        try:
            return Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return None

    def get(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)

        serializer=PropertySerializer(property)

        return Response(serializer.data)

    def put(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)

        serializer=PropertySerializer(property,data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400) 


    def delete(self,request,pk):
        property=self.get_property(pk)

        if property is None:
            return Response({"error": "Property not found"},status=404)
        property.delete()
        return Response({"message": "Property deleted successfully"},status=204)